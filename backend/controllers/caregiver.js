/**
 * Caregiver controller
 *
 * Endpoints used in Caregiver mode:
 * - List linked patients and computed stats (adherence, low supply, next appointment)
 * - Get all patient appointments
 * - Build a combined daily medication schedule across all linked patients
 *
 * Key functions:
 * - `getPatients`
 * - `getSchedule` (uses `MedicationLog` to determine taken/pending per time-slot)
 * - `buildAdherenceSummary` (weekly/monthly/yearly chart data)
 */

const User = require("../models/User");
const Medication = require("../models/Medication");
const MedicationLog = require("../models/MedicationLog");
const Appointment = require("../models/Appointments");
const mongoose = require("mongoose");

// Convert a Date (or now) to a local YYYY-MM-DD string (server timezone).
// Avoids UTC day shifts from Date#toISOString() when the date originates from local time.
const toLocalIsoDay = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
};

const getTodayStr = () => toLocalIsoDay(new Date());
const LOW_SUPPLY_THRESHOLD = 10;

// Keep caregiver schedule/log slot keys consistent across legacy values.
// The app historically allowed coarse buckets ("morning") and explicit HH:MM ("08:00").
// Normalize both to canonical 24h HH:MM where possible so intake logs match schedules.
const TIME_BUCKET_TO_24H = Object.freeze({
  morning: "08:00",
  afternoon: "12:00",
  night: "20:00",
});

const normalizeTimeSlotKey = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lowered = raw.toLowerCase();
  if (TIME_BUCKET_TO_24H[lowered]) return TIME_BUCKET_TO_24H[lowered];
  // Handle 12-hour format like "9:00 AM"
  const ampmMatch = lowered.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const minute = String(ampmMatch[2]);
    const ampm = String(ampmMatch[3]).toUpperCase();
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const hh = String(hour).padStart(2, "0");
    const mm = minute.padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const m = lowered.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hh = String(Number(m[1])).padStart(2, "0");
    const mm = String(m[2]).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return lowered;
};

const getAppointmentDateTime = (appointment) => {
  if (!appointment) return null;
  const baseDate =
    appointment.date instanceof Date
      ? appointment.date
      : new Date(appointment.date);
  if (Number.isNaN(baseDate.getTime())) return null;
  const dateTime = new Date(baseDate);
  if (appointment.time && typeof appointment.time === "string") {
    const [hours, minutes] = appointment.time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      dateTime.setHours(hours, minutes, 0, 0);
    }
  }
  return dateTime;
};

const getAppointmentDateString = (appointment) => {
  if (appointment?.dateDay && typeof appointment.dateDay === "string") {
    return appointment.dateDay;
  }
  const baseDate =
    appointment?.date instanceof Date
      ? appointment.date
      : new Date(appointment?.date);
  if (!baseDate || Number.isNaN(baseDate.getTime())) return null;
  return toLocalIsoDay(baseDate);
};

const isScheduledMedication = (med) => {
  if (!med) return false;
  if (med.timeOfDay) return true;
  if (Array.isArray(med.timesOfDay) && med.timesOfDay.length > 0) return true;
  return false;
};

// Treat "unscheduled" medications as 1 expected dose per day *only* when they are active.
// This matches the frontend behavior where unscheduled meds can appear in "Pending Today".
const isActiveUnscheduledMedication = (med) => {
  if (!med) return false;
  if (isScheduledMedication(med)) return false;
  const status = String(med.status || "").toLowerCase();
  return status === "pending" || status === "taken";
};

const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const parseIsoDayUtc = (isoDay) => {
  if (!ISO_DAY_RE.test(isoDay)) return null;
  // Treat stored YYYY-MM-DD as a UTC day.
  return new Date(`${isoDay}T00:00:00.000Z`);
};

// Parse a YYYY-MM-DD into a local (server timezone) end-of-day Date.
// Avoids `new Date("YYYY-MM-DD")` which is UTC in JS and can shift the day.
const parseIsoDayLocalEnd = (isoDay) => {
  if (!ISO_DAY_RE.test(isoDay)) return null;
  const [y, m, d] = isoDay.split("-").map((n) => Number(n));
  if (![y, m, d].every(Number.isFinite)) return null;
  return new Date(y, m - 1, d, 23, 59, 59, 999);
};

const toIsoDayUtc = (date) => {
  if (!(date instanceof Date)) return null;
  return date.toISOString().slice(0, 10);
};

const addUtcDays = (date, days) => {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const addUtcMonthsStart = (date, months) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
};

// Start of week (Monday) for a given UTC date (00:00Z assumed).
const getStartOfWeekUtcMonday = (utcDate) => {
  if (!(utcDate instanceof Date) || Number.isNaN(utcDate.getTime()))
    return null;
  const d = new Date(utcDate.getTime());
  const day = d.getUTCDay(); // 0 (Sun) .. 6 (Sat)
  const offset = (day + 6) % 7; // 0 for Mon, 6 for Sun
  d.setUTCDate(d.getUTCDate() - offset);
  return d;
};

const countDaysInclusive = (startIsoDay, endIsoDay) => {
  const start = parseIsoDayUtc(startIsoDay);
  const end = parseIsoDayUtc(endIsoDay);
  if (!start || !end) return 0;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
};

const getScheduleSlots = (med) => {
  if (!med) return [];
  const times = Array.isArray(med.timesOfDay) ? med.timesOfDay : null;
  if (times && times.length > 0) {
    return times
      .map((t) => String(t).trim())
      .filter(Boolean)
      .map((t) => normalizeTimeSlotKey(t))
      .filter(Boolean);
  }
  if (med.timeOfDay)
    return [normalizeTimeSlotKey(med.timeOfDay)].filter(Boolean);
  return [];
};

const getExpectedSlotsForMedication = (med) => {
  const slots = getScheduleSlots(med);
  if (slots.length > 0) return slots.length;
  return isActiveUnscheduledMedication(med) ? 1 : 0;
};

const roundPercent = (taken, expected) => {
  if (!expected || expected <= 0) return 0;
  const raw = Math.round((taken / expected) * 100);
  return Math.max(0, Math.min(100, raw));
};

const buildAdherenceSummary = async (patientId, medications) => {
  const todayStr = getTodayStr();
  const todayUtc = parseIsoDayUtc(todayStr);
  if (!todayUtc) {
    return {
      weekly: { labels: [], values: [], takenTotal: 0, expectedTotal: 0 },
      monthly: { labels: [], values: [], takenTotal: 0, expectedTotal: 0 },
      yearly: { labels: [], values: [], takenTotal: 0, expectedTotal: 0 },
    };
  }

  const medsList = Array.isArray(medications) ? medications : [];
  const scheduledMeds = medsList.filter(isScheduledMedication);
  const unscheduledActiveMeds = medsList.filter(isActiveUnscheduledMedication);
  const eligibleMeds = medsList.filter((m) => getExpectedSlotsForMedication(m) > 0);
  const eligibleMedIds = eligibleMeds.map((m) => m._id);
  const expectedPerDay = eligibleMeds.reduce(
    (sum, m) => sum + getExpectedSlotsForMedication(m),
    0,
  );

  // 12-month window (inclusive): start at first day of month, 11 months ago.
  const startOfThisMonthUtc = new Date(
    Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1),
  );
  const startYearUtc = addUtcMonthsStart(startOfThisMonthUtc, -11);
  const startYearStr = toIsoDayUtc(startYearUtc);

  const patientIdStr = patientId?.toString ? patientId.toString() : String(patientId || "");
  const patientIdQueryValues = Array.from(
    new Set([patientId, patientIdStr].filter(Boolean)),
  );

  const logs = await MedicationLog.find({
    patient: { $in: patientIdQueryValues },
    ...(eligibleMedIds.length > 0
      ? { medication: { $in: eligibleMedIds } }
      : {}),
    date: { $gte: startYearStr, $lte: todayStr },
  }).select("date");

  const takenCountByDate = new Map();
  for (const log of logs) {
    const d = log?.date;
    if (!d) continue;
    takenCountByDate.set(d, (takenCountByDate.get(d) || 0) + 1);
  }

  const getTakenForDate = (isoDay) => takenCountByDate.get(isoDay) || 0;

  // Weekly (calendar week, Monday -> Sunday)
  const weeklyStartUtc =
    getStartOfWeekUtcMonday(todayUtc) || addUtcDays(todayUtc, -6);
  const weeklyLabels = [];
  const weeklyValues = [];
  let weeklyTakenTotal = 0;
  for (let i = 0; i < 7; i++) {
    const d = addUtcDays(weeklyStartUtc, i);
    const iso = toIsoDayUtc(d);
    const taken = getTakenForDate(iso);
    weeklyTakenTotal += taken;
    // Always display Monday-first labels.
    weeklyLabels.push(["M", "T", "W", "T", "F", "S", "S"][i]);
    weeklyValues.push(roundPercent(taken, expectedPerDay));
  }
  const weeklyExpectedTotal = expectedPerDay * 7;

  // Monthly (last 4 weeks, 28 days) grouped into 4 buckets
  const monthlyStartUtc = addUtcDays(todayUtc, -27);
  const monthlyLabels = ["W1", "W2", "W3", "W4"];
  const monthlyValues = [];
  let monthlyTakenTotal = 0;
  for (let w = 0; w < 4; w++) {
    let takenSum = 0;
    for (let d = 0; d < 7; d++) {
      const iso = toIsoDayUtc(addUtcDays(monthlyStartUtc, w * 7 + d));
      const taken = getTakenForDate(iso);
      takenSum += taken;
    }
    monthlyTakenTotal += takenSum;
    monthlyValues.push(roundPercent(takenSum, expectedPerDay * 7));
  }
  const monthlyExpectedTotal = expectedPerDay * 28;

  // Yearly (last 12 months) grouped by month
  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const yearlyLabels = [];
  const yearlyValues = [];
  let yearlyTakenTotal = 0;
  let yearlyExpectedTotal = 0;
  for (let m = 0; m < 12; m++) {
    const monthStartUtc = addUtcMonthsStart(startYearUtc, m);
    const isCurrentMonth =
      monthStartUtc.getUTCFullYear() === todayUtc.getUTCFullYear() &&
      monthStartUtc.getUTCMonth() === todayUtc.getUTCMonth();

    const startIso = toIsoDayUtc(monthStartUtc);
    const endUtc = isCurrentMonth
      ? todayUtc
      : new Date(
          Date.UTC(
            monthStartUtc.getUTCFullYear(),
            monthStartUtc.getUTCMonth() + 1,
            0,
          ),
        );
    const endIso = toIsoDayUtc(endUtc);
    const daysIncluded = countDaysInclusive(startIso, endIso);

    let takenSum = 0;
    for (let d = 0; d < daysIncluded; d++) {
      const iso = toIsoDayUtc(addUtcDays(monthStartUtc, d));
      takenSum += getTakenForDate(iso);
    }

    const expectedSum = expectedPerDay * daysIncluded;
    yearlyTakenTotal += takenSum;
    yearlyExpectedTotal += expectedSum;
    yearlyLabels.push(monthShort[monthStartUtc.getUTCMonth()]);
    yearlyValues.push(roundPercent(takenSum, expectedSum));
  }

  return {
    meta: {
      expectedPerDay,
      scheduledMedications: scheduledMeds.length,
      unscheduledMedications: unscheduledActiveMeds.length,
    },
    weekly: {
      labels: weeklyLabels,
      values: weeklyValues,
      takenTotal: weeklyTakenTotal,
      expectedTotal: weeklyExpectedTotal,
    },
    monthly: {
      labels: monthlyLabels,
      values: monthlyValues,
      takenTotal: monthlyTakenTotal,
      expectedTotal: monthlyExpectedTotal,
    },
    yearly: {
      labels: yearlyLabels,
      values: yearlyValues,
      takenTotal: yearlyTakenTotal,
      expectedTotal: yearlyExpectedTotal,
    },
  };
};

const getPatients = async (req, res) => {
  try {
    const caregiverObjectId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    const caregiverIds = caregiverObjectId
      ? [req.user.id, caregiverObjectId]
      : [req.user.id];

    const patients = await User.find({
      $or: [
        { caregivers: { $in: caregiverIds } },
        { caregiver: { $in: caregiverIds } },
      ],
    }).select("-password");
    const today = getTodayStr();
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const patientObj = patient.toObject();
        patientObj.id = patient._id;
        const meds = await Medication.find({
          patient: patient._id,
          isArchived: { $ne: true },
        });
        const totalMeds = meds.length;
        const takenMeds = meds.filter(
          (m) => m.status === "taken" || m.taken,
        ).length;
        const eligibleMeds = meds.filter((m) => getExpectedSlotsForMedication(m) > 0);
        const eligibleMedIds = eligibleMeds.map((m) => m._id);
        const expectedDosesToday = eligibleMeds.reduce(
          (sum, m) => sum + getExpectedSlotsForMedication(m),
          0,
        );
        const patientIdQueryValues = [patient._id, patient._id.toString()];
        const takenDosesToday =
          eligibleMedIds.length > 0
            ? await MedicationLog.countDocuments({
                patient: { $in: patientIdQueryValues },
                date: today,
                medication: { $in: eligibleMedIds },
              })
            : 0;

        // Keep legacy field names but use dose/slot-level semantics.
        const medicationsTotalToday = expectedDosesToday;
        const medicationsTakenToday = takenDosesToday;
        const adherenceRate =
          expectedDosesToday > 0
            ? Math.round((takenDosesToday / expectedDosesToday) * 100)
            : 0;

        // Check for low supply alerts
        const lowSupplyMedications = meds
          .filter((m) => {
            const qty = Number(m.quantity);
            return Number.isFinite(qty) && qty < LOW_SUPPLY_THRESHOLD;
          })
          .map((m) => ({
            id: m._id,
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            recommendSupply: m.recommendSupply,
            initialQuantity: m.initialQuantity,
          }));

        const alerts = meds.filter((m) => {
          const qty = Number(m.quantity);
          return Number.isFinite(qty) && qty < LOW_SUPPLY_THRESHOLD; // Low supply threshold
        }).length;
        const now = new Date();
        const allAppointments = await Appointment.find({
          patient: patient._id,
        }).sort({ date: 1, time: 1 });

        let nextAppointment = null;
        for (const apt of allAppointments) {
          const aptDateTime = getAppointmentDateTime(apt);
          if (!aptDateTime) continue;
          if (aptDateTime > now) {
            nextAppointment = {
              title: apt.title,
              date: getAppointmentDateString(apt),
              time: apt.time,
            };
            break;
          }
        }

        return {
          ...patientObj,
          medicationsTotal: totalMeds,
          medicationsTaken: takenMeds,
          medicationsTotalToday,
          medicationsTakenToday,
          adherenceRate,
          alerts,
          lowSupplyMedications,
          nextAppointment,
        };
      }),
    );

    res.json(patientsWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPatient = async (req, res) => {
  try {
    const { email } = req.body;

    if (req.user?.role !== "caregiver") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const requestedEmail = String(email).trim().toLowerCase();
    if (!requestedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const caregiver = await User.findById(req.user.id).select("email role");
    if (!caregiver) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (caregiver.role !== "caregiver") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const caregiverEmail = String(caregiver.email || "")
      .trim()
      .toLowerCase();
    if (caregiverEmail && caregiverEmail === requestedEmail) {
      return res.status(400).json({
        message:
          "You cannot add a patient with the same email as your caregiver account.",
      });
    }

    const patient = await User.findOne({
      email: requestedEmail,
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        message:
          "Patient not found. The patient must have an existing account.",
      });
    }
    if (patient.role !== "patient") {
      return res.status(400).json({
        message: "The email provided does not belong to a patient account.",
      });
    }
    const isLinked =
      (patient.caregivers &&
        patient.caregivers.some((id) => id.toString() === req.user.id)) ||
      (patient.caregiver && patient.caregiver.toString() === req.user.id);

    if (isLinked) {
      return res
        .status(400)
        .json({ message: "This patient is already linked to you." });
    }

    if (!patient.caregivers || !Array.isArray(patient.caregivers)) {
      patient.caregivers = [];
    }
    if (typeof patient.caregivers.addToSet === "function") {
      patient.caregivers.addToSet(req.user.id);
    } else if (
      !patient.caregivers.some((id) => id.toString() === req.user.id)
    ) {
      patient.caregivers.push(req.user.id);
    }
    await patient.save();

    const patientObj = patient.toObject();
    delete patientObj.password;
    patientObj.id = patientObj._id;
    const meds = await Medication.find({
      patient: patient._id,
      isArchived: { $ne: true },
    });
    const totalMeds = meds.length;
    const takenMeds = meds.filter(
      (m) => m.status === "taken" || m.taken,
    ).length;
    const today = getTodayStr();
    const eligibleMeds = meds.filter((m) => getExpectedSlotsForMedication(m) > 0);
    const eligibleMedIds = eligibleMeds.map((m) => m._id);
    const expectedDosesToday = eligibleMeds.reduce(
      (sum, m) => sum + getExpectedSlotsForMedication(m),
      0,
    );
    const patientIdQueryValues = [patient._id, patient._id.toString()];
    const takenDosesToday =
      eligibleMedIds.length > 0
        ? await MedicationLog.countDocuments({
            patient: { $in: patientIdQueryValues },
            date: today,
            medication: { $in: eligibleMedIds },
          })
        : 0;
    const medicationsTotalToday = expectedDosesToday;
    const medicationsTakenToday = takenDosesToday;
    const adherenceRate =
      expectedDosesToday > 0
        ? Math.round((takenDosesToday / expectedDosesToday) * 100)
        : 0;
    const alerts = meds.filter((m) => {
      const qty = Number(m.quantity);
      return Number.isFinite(qty) && qty < 10;
    }).length;

    const allAppointments = await Appointment.find({
      patient: patient._id,
    }).sort({ date: 1, time: 1 });

    let nextAppointment = null;
    const now = new Date();
    for (const appt of allAppointments) {
      const apptDateTime = getAppointmentDateTime(appt);
      if (!apptDateTime) continue;
      if (apptDateTime >= now) {
        nextAppointment = {
          title: appt.title,
          date: getAppointmentDateString(appt),
          time: appt.time,
        };
        break;
      }
    }
    res.status(200).json({
      ...patientObj,
      medicationsTotal: totalMeds,
      medicationsTaken: takenMeds,
      medicationsTotalToday,
      medicationsTakenToday,
      adherenceRate,
      alerts,
      nextAppointment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const caregiverObjectId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    const patient = await User.findOne({
      _id: req.params.id,
      $or: [
        { caregivers: req.user.id },
        ...(caregiverObjectId ? [{ caregivers: caregiverObjectId }] : []),
        { caregiver: req.user.id },
      ],
    });
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found or not authorized" });
    }
    const caregiversToPull = caregiverObjectId
      ? { $in: [req.user.id, caregiverObjectId] }
      : req.user.id;

    await User.updateOne(
      { _id: req.params.id },
      {
        $pull: { caregivers: caregiversToPull },
        $unset: { caregiver: "" },
      },
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const caregiverObjectId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    const caregiverIds = caregiverObjectId
      ? [req.user.id, caregiverObjectId]
      : [req.user.id];

    const patient = await User.findOne({
      _id: req.params.id,
      $or: [
        { caregivers: { $in: caregiverIds } },
        { caregiver: { $in: caregiverIds } },
      ],
    }).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const medications = await Medication.find({
      patient: patient._id,
      isArchived: { $ne: true },
    });
    const appointments = await Appointment.find({ patient: patient._id }).sort({
      date: 1,
    });

    const adherence = await buildAdherenceSummary(patient._id, medications);

    res.json({ ...patient.toObject(), medications, appointments, adherence });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const caregiverObjectId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    const caregiverIds = caregiverObjectId
      ? [req.user.id, caregiverObjectId]
      : [req.user.id];

    const patients = await User.find({
      $or: [
        { caregivers: { $in: caregiverIds } },
        { caregiver: { $in: caregiverIds } },
      ],
    }).select("_id");
    const patientIds = patients.map((p) => p._id);
    const patientIdQueryValues = Array.from(
      new Set([...patientIds, ...patientIds.map((id) => id.toString())]),
    );
    const appointments = await Appointment.find({
      patient: { $in: patientIdQueryValues },
    })
      .populate("patient", "name")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const requestedDateRaw = req.query.date || getTodayStr();
    const date = ISO_DAY_RE.test(String(requestedDateRaw))
      ? String(requestedDateRaw)
      : getTodayStr();
    const requestedDayEnd = parseIsoDayLocalEnd(date);
    const caregiverObjectId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    const caregiverIds = caregiverObjectId
      ? [req.user.id, caregiverObjectId]
      : [req.user.id];

    const patients = await User.find({
      $or: [
        { caregivers: { $in: caregiverIds } },
        { caregiver: { $in: caregiverIds } },
      ],
    }).select("_id name");

    const patientIds = patients.map((p) => p._id);
    const patientIdQueryValues = Array.from(
      new Set([...patientIds, ...patientIds.map((id) => id.toString())]),
    );
    if (patientIds.length === 0) return res.json([]);

    const patientNameMap = new Map(
      patients.map((p) => [p._id.toString(), p.name]),
    );

    const medications = await Medication.find({
      patient: { $in: patientIds },
      isArchived: { $ne: true },
      ...(requestedDayEnd ? { createdAt: { $lte: requestedDayEnd } } : {}),
      $or: [
        { timeOfDay: { $ne: null } },
        { timesOfDay: { $exists: true, $ne: [] } },
        { status: { $in: ["pending", "taken"] } },
      ],
    }).select("_id name patient timeOfDay timesOfDay status createdAt");

    const logs = await MedicationLog.find({
      patient: { $in: patientIdQueryValues },
      date,
    }).select("medication timeSlot");

    const takenSet = new Set(
      logs
        .map((log) => {
          const medId = log?.medication?.toString?.() || "";
          const slotKey = normalizeTimeSlotKey(log?.timeSlot);
          if (!medId || !slotKey) return null;
          return `${medId}-${slotKey}`;
        })
        .filter(Boolean),
    );

    const schedule = medications.flatMap((med) => {
      let times =
        Array.isArray(med.timesOfDay) && med.timesOfDay.length > 0
          ? med.timesOfDay
          : med.timeOfDay
            ? [med.timeOfDay]
            : [];

      if (!times.length && isActiveUnscheduledMedication(med)) {
        // Unscheduled meds can still be tracked as 1 daily dose via the synthetic slot "scheduled".
        times = ["scheduled"];
      }

      return times
        .map((time) => {
          const slotKey = normalizeTimeSlotKey(time);
          if (!slotKey) return null;
          return {
            id: `${med._id.toString()}-${slotKey}`,
            medicationId: med._id,
            medicationName: med.name,
            patientId: med.patient,
            patientName: patientNameMap.get(med.patient.toString()) || "Unknown",
            time: slotKey,
            status: takenSet.has(`${med._id.toString()}-${slotKey}`)
              ? "taken"
              : "pending",
          };
        })
        .filter(Boolean);
    });

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPatients,
  addPatient,
  deletePatient,
  getPatientById,
  getAllAppointments,
  getSchedule,
};
