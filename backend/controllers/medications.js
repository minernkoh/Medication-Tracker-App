/**
 * Medications controller
 *
 * Handles medication CRUD plus daily adherence logic.
 * Important concept: "taken vs pending" for a specific date/time-slot is tracked
 * in `MedicationLog`, not only on the `Medication` document.
 *
 * Key functions:
 * - `getMedications`: date-aware list (supports `?date=YYYY-MM-DD` and `?status=` filtering)
 * - `markMedicationAsTaken`: upserts a `MedicationLog` row and updates supply
 * - `undoMarkAsTaken`: removes log(s) and restores supply
 */

const Medication = require("../models/Medication");
const MedicationLog = require("../models/MedicationLog");
const User = require("../models/User");
const { checkPatientAccess } = require("../utils/auth");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Normalize schedule/log slot keys so legacy values still match:
// - "morning"/"afternoon"/"night" -> canonical HH:MM
// - "9:00 AM" -> "09:00"
// - "9:00" -> "09:00"
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

const buildTimeSlotKeySet = (rawValue) => {
  const raw = String(rawValue || "").trim();
  const normalized = normalizeTimeSlotKey(raw);
  const out = new Set();
  if (raw) out.add(raw);
  if (normalized) out.add(normalized);
  // Add bucket equivalents when possible (helps undo legacy logs)
  if (normalized === "08:00") out.add("morning");
  if (normalized === "12:00") out.add("afternoon");
  if (normalized === "20:00") out.add("night");
  return out;
};

const toLocalIsoDay = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
};

const addDaysToIsoDay = (isoDay, days) => {
  if (!isoDay || !Number.isFinite(days)) return isoDay;
  const base = new Date(`${isoDay}T00:00:00`);
  if (Number.isNaN(base.getTime())) return isoDay;
  base.setDate(base.getDate() + days);
  return toLocalIsoDay(base);
};

const getDailyDoseCount = (med) => {
  const times = Array.isArray(med?.timesOfDay) ? med.timesOfDay : [];
  if (times.length > 0) return times.length;
  if (med?.timeOfDay) return 1;

  const frequency = String(med?.frequency || "")
    .trim()
    .toLowerCase();
  if (!frequency) return 0;
  const timesMatch = frequency.match(/(\d+)\s*times\s*per\s*day/);
  if (timesMatch) return Number(timesMatch[1]) || 0;
  if (frequency.includes("once daily")) return 1;
  const hoursMatch = frequency.match(/every\s+(\d+)\s*hour/);
  if (hoursMatch) {
    const hours = Number(hoursMatch[1]);
    if (Number.isFinite(hours) && hours > 0) {
      return Math.floor(24 / hours);
    }
  }
  return 0;
};

const getSupplyWindowEndDate = ({ date, today, startDate, med }) => {
  const dosage = Number(med?.dosage);
  const dosesPerDay = getDailyDoseCount(med);
  if (!Number.isFinite(dosage) || dosage <= 0 || dosesPerDay <= 0) {
    return null;
  }

  const useCurrentSupply = date >= today;
  const rawQuantity = useCurrentSupply
    ? Number(med?.quantity)
    : Number(med?.initialQuantity ?? med?.quantity);

  if (!Number.isFinite(rawQuantity)) return null;

  const dailyDose = dosage * dosesPerDay;
  if (!Number.isFinite(dailyDose) || dailyDose <= 0) return null;

  const supplyDays = Math.floor(rawQuantity / dailyDose);
  if (supplyDays <= 0) return "__none__";

  if (useCurrentSupply) {
    const isFuture = date > today;
    const anchor = isFuture ? addDaysToIsoDay(today, 1) : today;
    return addDaysToIsoDay(anchor, supplyDays - 1);
  }

  return addDaysToIsoDay(startDate, supplyDays - 1);
};

const getMedications = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    if (req.params.patientId) {
      const patient = await User.findById(patientId);
      if (!patient)
        return res.status(404).json({ message: "Patient not found" });
      const access = checkPatientAccess(req.user, patient, false);
      if (!access.authorized)
        return res.status(403).json({ message: access.message });
    }

    const date = req.query.date || (req.query.status ? toLocalIsoDay() : null);
    const isArchivedFilter = { isArchived: { $ne: true } };

    if (date) {
      const logs = await MedicationLog.find({ patient: patientId, date });
      const loggedMedicationIds = Array.from(
        new Set(
          (Array.isArray(logs) ? logs : []).map((l) => String(l.medication)),
        ),
      );

      const meds = await Medication.find({
        patient: patientId,
        $or: [
          isArchivedFilter,
          ...(loggedMedicationIds.length > 0
            ? [{ _id: { $in: loggedMedicationIds } }]
            : []),
        ],
      });

      const logsByMedication = new Map();
      const takenAtByMedication = new Map();

      for (const log of logs) {
        const medId = log.medication.toString();
        const slot = normalizeTimeSlotKey(log.timeSlot);
        if (!logsByMedication.has(medId)) {
          logsByMedication.set(medId, new Set());
        }
        if (slot) {
          logsByMedication.get(medId).add(slot);
          if (!takenAtByMedication.has(medId)) {
            takenAtByMedication.set(medId, new Map());
          }
          takenAtByMedication.get(medId).set(slot, log.takenAt || null);
        }
      }

      const todayStr = toLocalIsoDay();

      const medsWithStatus = meds
        .map((med) => {
          const medObj = med.toObject({ virtuals: true });
          const medId = med._id.toString();
          const takenSlots = logsByMedication.get(medId) || new Set();
          const hasLogsForDate = takenSlots.size > 0;
          const scheduledSlotsRaw = Array.isArray(medObj.timesOfDay)
            ? medObj.timesOfDay
            : medObj.timeOfDay
              ? [medObj.timeOfDay]
              : [];
          const scheduledSlots = scheduledSlotsRaw
            .map((s) => normalizeTimeSlotKey(s))
            .filter(Boolean);
          const pendingSlots = scheduledSlots.filter(
            (slot) => !takenSlots.has(slot),
          );

          const activeFromStr = (medObj?.activeFrom || medObj?.createdAt)
            ? toLocalIsoDay(medObj.activeFrom || medObj.createdAt)
            : null;

          if (activeFromStr && date < activeFromStr && !hasLogsForDate) {
            return null;
          }

          if (activeFromStr) {
            const supplyEndDate = getSupplyWindowEndDate({
              date,
              today: todayStr,
              startDate: activeFromStr,
              med: medObj,
            });
            if (supplyEndDate === "__none__" && !hasLogsForDate) {
              return null;
            }
            if (supplyEndDate && date > supplyEndDate && !hasLogsForDate) {
              return null;
            }
          }

          medObj.scheduledSlots = scheduledSlots;
          medObj.takenSlots = Array.from(takenSlots);
          medObj.pendingSlots = pendingSlots;

          const takenTimesMap = takenAtByMedication.get(medId);
          if (takenTimesMap) {
            medObj.takenTimesBySlot = Array.from(
              takenTimesMap.entries(),
            ).reduce((acc, [slot, takenAt]) => {
              acc[slot] = takenAt;
              return acc;
            }, {});
          }

          if (scheduledSlots.length > 0) {
            const allTaken = scheduledSlots.every((slot) =>
              takenSlots.has(slot),
            );
            if (allTaken) {
              medObj.status = "taken";
              medObj.taken = true;
            } else {
              medObj.status = "pending";
              medObj.taken = false;
            }
          } else if (takenSlots.size > 0) {
            medObj.status = "taken";
            medObj.taken = true;
          } else if (medObj.status === "taken" || medObj.status === "pending") {
            medObj.status = "pending";
            medObj.taken = false;
          }

          // Archived meds should only surface in history contexts; if they have any
          // intake logs for the requested date, treat them as "taken" so they show
          // under taken/history views (and not as pending/supply).
          if (medObj.isArchived && takenSlots.size > 0) {
            medObj.status = "taken";
            medObj.taken = true;
          }

          return medObj;
        })
        .filter(Boolean);
      if (req.query.status) {
        return res.json(
          medsWithStatus.filter((m) => m.status === req.query.status),
        );
      }
      return res.json(medsWithStatus);
    }

    const meds = await Medication.find({
      patient: patientId,
      ...isArchivedFilter,
    });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedicationsForDate = async (req, res) => {
  return getMedications(req, res);
};

const getMedicationsDueToday = async (req, res) => {
  req.query.status = "pending";
  return getMedications(req, res);
};

const getMedicationSupply = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    const meds = await Medication.find({
      patient: patientId,
      isArchived: { $ne: true },
    });
    const supply = meds.filter(
      (m) =>
        m.quantity !== undefined &&
        m.quantity !== null &&
        String(m.quantity).trim() !== "",
    );
    res.json(supply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedicationById = async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    const patient = await User.findById(med.patient);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const access = checkPatientAccess(req.user, patient, false);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markMedicationAsTaken = async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    const patient = await User.findById(med.patient);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    const date = req.body?.date || toLocalIsoDay();
    const activeFromStr = med?.activeFrom
      ? toLocalIsoDay(med.activeFrom)
      : med?.createdAt
        ? toLocalIsoDay(med.createdAt)
        : null;

    // Prevent creating "history" before the medication existed/was activated.
    if (activeFromStr && date < activeFromStr) {
      return res.status(400).json({
        message:
          "Cannot record intake for a date before this medication was added.",
      });
    }
    const takenTime =
      req.body?.takenTime ||
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    let timeSlot = req.body?.timeSlot || req.body?.timeOfDay;
    if (!timeSlot) {
      timeSlot = med.timeOfDay;
    }
    if (!timeSlot && Array.isArray(med.timesOfDay) && med.timesOfDay.length) {
      timeSlot = med.timesOfDay[0];
    }
    if (!timeSlot) {
      timeSlot = "scheduled";
    }
    timeSlot = normalizeTimeSlotKey(timeSlot) || "scheduled";
    await MedicationLog.findOneAndUpdate(
      { medication: med._id, date, timeSlot },
      { patient: patient._id, takenAt: new Date() },
      { upsert: true, new: true },
    );
    const update = {
      $set: {
        status: "taken",
        taken: true,
        takenTime,
      },
    };
    if (med.quantity) {
      update.$inc = { quantity: -Math.abs(med.dosage) };
    }

    const updated = await Medication.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const undoMarkAsTaken = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid medication id" });
    }

    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    const patient = await User.findById(med.patient);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    const date = req.body?.date || toLocalIsoDay();
    const timeSlot = req.body?.timeSlot || req.body?.timeOfDay || null;
    const timeSlotKeys = timeSlot ? Array.from(buildTimeSlotKeySet(timeSlot)) : null;

    const query = { medication: med._id, date };
    if (timeSlotKeys && timeSlotKeys.length > 0) {
      query.timeSlot = { $in: timeSlotKeys };
    }
    const deleteResult = await MedicationLog.deleteMany(query);

    const deletedCount = deleteResult?.deletedCount || 0;
    if (!deletedCount) {
      return res
        .status(404)
        .json({ message: "No intake record found for this date" });
    }
    const update = {
      $set: {
        status: "pending",
        taken: false,
        takenTime: null,
      },
    };

    if (med.quantity) {
      const restoreAmount = Number(med.dosage) * deletedCount;
      update.$inc = { quantity: restoreAmount };
    }

    const updated = await Medication.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMedication = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const patientId = req.params.patientId || req.body.patient || req.user.id;
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    // If an archived medication with the same (name + dosage + unit) exists,
    // revive it instead of creating a new record. This preserves historical logs.
    const name = String(req.body?.name || "").trim();
    const dosage = Number(req.body?.dosage);
    const unit = String(req.body?.unit || "").trim() || "pills";

    let revived = null;
    if (name && Number.isFinite(dosage) && unit) {
      revived = await Medication.findOne({
        patient: patientId,
        isArchived: true,
        dosage,
        unit,
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
      }).sort({ archivedAt: -1, updatedAt: -1 });
    }

    if (revived) {
      const updated = await Medication.findByIdAndUpdate(
        revived._id,
        {
          ...req.body,
          patient: patientId,
          createdBy: req.user.id,
          activeFrom: new Date(),
          isArchived: false,
          archivedAt: null,
        },
        { new: true, runValidators: true },
      );
      return res.status(201).json(updated);
    }

    const med = await Medication.create({
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
      activeFrom: new Date(),
      isArchived: false,
      archivedAt: null,
    });

    return res.status(201).json(med);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateMedication = async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    const patient = await User.findById(med.patient);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    delete req.body.patient;
    delete req.body.createdBy;

    const updatedMed = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.json(updatedMed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMedication = async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    const patient = await User.findById(med.patient);

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    await Medication.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: true, archivedAt: new Date() } },
      { new: false },
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMedications,
  getMedicationsForDate,
  getMedicationsDueToday,
  getMedicationSupply,
  getMedicationById,
  markMedicationAsTaken,
  undoMarkAsTaken,
  createMedication,
  updateMedication,
  deleteMedication,
};
