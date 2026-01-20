const Medication = require("../models/Medication");
const MedicationLog = require("../models/MedicationLog");
const User = require("../models/User");
const { checkPatientAccess } = require("../utils/auth");

const toLocalIsoDay = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
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

    const query = { patient: patientId };
    const date = req.query.date || (req.query.status ? toLocalIsoDay() : null);

    const meds = await Medication.find(query);

    if (date) {
      const logs = await MedicationLog.find({ patient: patientId, date });
      const logsByMedication = new Map();
      const takenAtByMedication = new Map();

      for (const log of logs) {
        const medId = log.medication.toString();
        const slot = log.timeSlot;
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

      const medsWithStatus = meds.map((med) => {
        const medObj = med.toObject({ virtuals: true });
        const medId = med._id.toString();
        const takenSlots = logsByMedication.get(medId) || new Set();
        const scheduledSlots = Array.isArray(medObj.timesOfDay)
          ? medObj.timesOfDay
          : medObj.timeOfDay
            ? [medObj.timeOfDay]
            : [];
        const pendingSlots = scheduledSlots.filter(
          (slot) => !takenSlots.has(slot),
        );

        medObj.scheduledSlots = scheduledSlots;
        medObj.takenSlots = Array.from(takenSlots);
        medObj.pendingSlots = pendingSlots;

        const takenTimesMap = takenAtByMedication.get(medId);
        if (takenTimesMap) {
          medObj.takenTimesBySlot = Array.from(takenTimesMap.entries()).reduce(
            (acc, [slot, takenAt]) => {
              acc[slot] = takenAt;
              return acc;
            },
            {},
          );
        }

        if (scheduledSlots.length > 0) {
          const allTaken = scheduledSlots.every((slot) => takenSlots.has(slot));
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

        return medObj;
      });
      if (req.query.status) {
        return res.json(
          medsWithStatus.filter((m) => m.status === req.query.status),
        );
      }
      return res.json(medsWithStatus);
    }

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
    const meds = await Medication.find({ patient: patientId });
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

    const query = { medication: med._id, date };
    if (timeSlot) {
      query.timeSlot = timeSlot;
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

    const med = await Medication.create({
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
    });

    res.status(201).json(med);
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

    await Medication.findByIdAndDelete(req.params.id);
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
