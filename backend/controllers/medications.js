const Medication = require("../models/Medication");
const User = require("../models/User");
const { checkPatientAccess } = require("../utils/auth");

const getMedications = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    const meds = await Medication.find({ patient: patientId });
    res.json(meds);
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

const createMedication = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      console.error("MongoDB not connected. Connection state:", mongoose.connection.readyState);
      return res.status(503).json({ message: "Database not connected" });
    }

    const patientId = req.params.patientId || req.user.id;
    const patient = await User.findById(patientId);
    if (!patient) {
      console.error("Patient not found:", patientId);
      return res.status(404).json({ message: "Patient not found" });
    }
    
    if (patient && patient.caregiver && req.user.id === patient.id) {
      return res.status(403).json({ message: "Patient has read only access" });
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
      { new: true }
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
    const isPatient = req.user.id === patient.id;
    const isCaregiver =
      req.user.role === "caregiver" &&
      patient.caregiver?.toString() === req.user.id;

    if (isPatient && patient.caregiver) {
      return res.status(403).json({ message: "Patient has read only access" });
    }

    if (!isPatient && !isCaregiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Medication.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
};
