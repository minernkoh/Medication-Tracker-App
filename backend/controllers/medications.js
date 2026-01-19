const Medication = require("../models/Medication");
const MedicationLog = require("../models/MedicationLog");
const User = require("../models/User");
const { checkPatientAccess } = require("../utils/auth");
const { decrementQuantity, incrementQuantity } = require("../utils/medication");

const getMedications = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;

    // If a caregiver is accessing a specific patient's medications, verify access
    if (req.params.patientId) {
      const patient = await User.findById(patientId);
      if (!patient)
        return res.status(404).json({ message: "Patient not found" });
      const access = checkPatientAccess(req.user, patient, false);
      if (!access.authorized)
        return res.status(403).json({ message: access.message });
    }

    const query = { patient: patientId };

    // Get date from query (YYYY-MM-DD), default to today if status filter is applied
    // but allow returning all meds (supply) if no date/status is provided
    const date =
      req.query.date ||
      (req.query.status ? new Date().toISOString().split("T")[0] : null);

    const meds = await Medication.find(query);

    if (date) {
      // Fetch logs for this date to determine daily status
      const logs = await MedicationLog.find({ patient: patientId, date });
      const loggedMedIds = new Set(logs.map((l) => l.medication.toString()));

      const medsWithStatus = meds.map((med) => {
        const medObj = med.toObject({ virtuals: true });
        const isTakenToday = loggedMedIds.has(med._id.toString());

        // Dynamic status based on log
        if (isTakenToday) {
          medObj.status = "taken";
          medObj.taken = true;
          // Find the specific log to get the takenTime if we wanted to be precise,
          // but for now the global takenTime might suffice or we can leave it
        } else if (medObj.status === "taken" || medObj.status === "pending") {
          // If it was globally "taken", but not in the log for THIS date, it's actually "pending" for THIS date
          medObj.status = "pending";
          medObj.taken = false;
        }
        return medObj;
      });

      // Apply filter if requested
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
  // NOTE: The current data model does not store per-day schedules.
  // This endpoint exists to match the frontend API surface area and
  // returns the same as GET /medications for now.
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

    const date = req.body?.date || new Date().toISOString().split("T")[0];
    const takenTime =
      req.body?.takenTime ||
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    const timeSlot =
      req.body?.timeSlot || req.body?.timeOfDay || med.timeOfDay || "scheduled";

    // Create a log entry for this day
    await MedicationLog.findOneAndUpdate(
      { medication: med._id, date, timeSlot },
      { patient: patient._id, takenAt: new Date() },
      { upsert: true, new: true },
    );

    // Update the medication's global quantity and last taken status
    const update = {
      status: "taken", // Global status still "taken" to represent last state
      taken: true,
      takenTime,
    };

    // Decrement quantity if applicable
    if (med.quantity) {
      update.quantity = decrementQuantity(med.quantity, med.dosage);
    }

    const updated = await Medication.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("markMedicationAsTaken error:", err);
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

    const date = req.body?.date || new Date().toISOString().split("T")[0];
    const timeSlot = req.body?.timeSlot || req.body?.timeOfDay || null;

    // Delete the log entry
    const log = await MedicationLog.findOneAndDelete({
      medication: med._id,
      date,
      ...(timeSlot ? { timeSlot } : {}),
    });

    if (!log) {
      return res
        .status(404)
        .json({ message: "No intake record found for this date" });
    }

    // Restore quantity
    const update = {
      status: "pending",
      taken: false,
      takenTime: null,
    };

    if (med.quantity) {
      update.quantity = incrementQuantity(med.quantity, med.dosage);
    }

    const updated = await Medication.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("undoMarkAsTaken error:", err);
    res.status(500).json({ message: err.message });
  }
};

const createMedication = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "MongoDB not connected. Connection state:",
        mongoose.connection.readyState,
      );
      return res.status(503).json({ message: "Database not connected" });
    }
    // Ensure patientId is declared only once
    const patientId = req.params.patientId || req.body.patient || req.user.id;
    const patient = await User.findById(patientId);
    if (!patient) {
      console.error("Patient not found:", patientId);
      return res.status(404).json({ message: "Patient not found" });
    }

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    console.log("Creating medication with data:", {
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
    });

    const med = await Medication.create({
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
    });

    console.log("Medication created successfully:", med._id);
    res.status(201).json(med);
  } catch (err) {
    console.error("Error creating medication:", err);
    console.error("Error details:", {
      message: err.message,
      name: err.name,
      errors: err.errors,
      stack: err.stack,
    });
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
