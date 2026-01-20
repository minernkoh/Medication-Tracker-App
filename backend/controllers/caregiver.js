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

const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const parseIsoDayUtc = (isoDay) => {
  if (!ISO_DAY_RE.test(isoDay)) return null;
  // Treat stored YYYY-MM-DD as a UTC day.
  return new Date(`${isoDay}T00:00:00.000Z`);
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
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
};

// Start of week (Monday) for a given UTC date (00:00Z assumed).
const getStartOfWeekUtcMonday = (utcDate) => {
  if (!(utcDate instanceof Date) || Number.isNaN(utcDate.getTime())) return null;
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
      .map((t) => t.toLowerCase());
  }
  if (med.timeOfDay) return [String(med.timeOfDay).trim().toLowerCase()].filter(Boolean);
  return [];
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

  const scheduledMeds = (Array.isArray(medications) ? medications : []).filter(
    isScheduledMedication,
  );
  const scheduledMedIds = scheduledMeds.map((m) => m._id);
  const expectedPerDay = scheduledMeds.reduce(
    (sum, m) => sum + getScheduleSlots(m).length,
    0,
  );

  // 12-month window (inclusive): start at first day of month, 11 months ago.
  const startOfThisMonthUtc = new Date(
    Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1),
  );
  const startYearUtc = addUtcMonthsStart(startOfThisMonthUtc, -11);
  const startYearStr = toIsoDayUtc(startYearUtc);

  const logs = await MedicationLog.find({
    patient: patientId,
    ...(scheduledMedIds.length > 0 ? { medication: { $in: scheduledMedIds } } : {}),
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
  const weeklyStartUtc = getStartOfWeekUtcMonday(todayUtc) || addUtcDays(todayUtc, -6);
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
      : new Date(Date.UTC(monthStartUtc.getUTCFullYear(), monthStartUtc.getUTCMonth() + 1, 0));
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
    meta: { expectedPerDay, scheduledMedications: scheduledMeds.length },
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
        const scheduledMeds = meds.filter(isScheduledMedication);
        const medicationsTotalToday = scheduledMeds.length;
        const logs = await MedicationLog.find({
          patient: patient._id,
          date: today,
        }).select("medication");
        const takenTodayIds = new Set(logs.map((l) => l.medication.toString()));
        const medicationsTakenToday = scheduledMeds.filter((m) =>
          takenTodayIds.has(m._id.toString()),
        ).length;
        // Today's adherence rate (scheduled meds vs taken logs for today)
        const adherenceRate =
          medicationsTotalToday > 0
            ? Math.round((medicationsTakenToday / medicationsTotalToday) * 100)
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

    const caregiverEmail = String(caregiver.email || "").trim().toLowerCase();
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
    const scheduledMeds = meds.filter(isScheduledMedication);
    const medicationsTotalToday = scheduledMeds.length;
    const logs = await MedicationLog.find({
      patient: patient._id,
      date: today,
    }).select("medication");
    const takenTodayIds = new Set(logs.map((l) => l.medication.toString()));
    const medicationsTakenToday = scheduledMeds.filter((m) =>
      takenTodayIds.has(m._id.toString()),
    ).length;
    const adherenceRate =
      medicationsTotalToday > 0
        ? Math.round((medicationsTakenToday / medicationsTotalToday) * 100)
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
    const patients = await User.find({
      $or: [{ caregivers: req.user.id }, { caregiver: req.user.id }],
    }).select("_id");
    const patientIds = patients.map((p) => p._id);
    const appointments = await Appointment.find({
      patient: { $in: patientIds },
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
    const date = req.query.date || getTodayStr();
    const patients = await User.find({
      $or: [{ caregivers: req.user.id }, { caregiver: req.user.id }],
    }).select("_id name");

    const patientIds = patients.map((p) => p._id);
    if (patientIds.length === 0) return res.json([]);

    const patientNameMap = new Map(
      patients.map((p) => [p._id.toString(), p.name]),
    );

    const medications = await Medication.find({
      patient: { $in: patientIds },
      isArchived: { $ne: true },
      $or: [
        { timeOfDay: { $ne: null } },
        { timesOfDay: { $exists: true, $ne: [] } },
      ],
    }).select("_id name patient timeOfDay timesOfDay status");

    const logs = await MedicationLog.find({
      patient: { $in: patientIds },
      date,
    }).select("medication timeSlot");

    const takenSet = new Set(
      logs.map((log) => `${log.medication.toString()}-${log.timeSlot}`),
    );

    const schedule = medications.flatMap((med) => {
      const times =
        Array.isArray(med.timesOfDay) && med.timesOfDay.length > 0
          ? med.timesOfDay
          : med.timeOfDay
            ? [med.timeOfDay]
            : [];

      return times.map((time) => ({
        id: `${med._id.toString()}-${time}`,
        medicationId: med._id,
        medicationName: med.name,
        patientId: med.patient,
        patientName: patientNameMap.get(med.patient.toString()) || "Unknown",
        time,
        status: takenSet.has(`${med._id.toString()}-${time}`)
          ? "taken"
          : "pending",
      }));
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
