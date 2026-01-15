const Medication = require("../models/Medication");
const User = require("../models/User");

const getMedications = async (req, res) => {
  try {
    const meds = await Medication.find({ patient: req.params.patientId });
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

    const isPatient = req.user.id === patient.id;
    const isCaregiver =
      req.user.role === "caregiver" &&
      patient.caregiver?.toString() === req.user.id;

    if (!isPatient && !isCaregiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMedication = async (req, res) => {
  try {
    const patient = await User.findById(req.params.patientId);
    if (patient && patient.caregiver && req.user.id === patient.id) {
      return res.status(403).json({ message: "Patient has read only access" });
    }

    const med = await Medication.create({
      ...req.body,
      patient: req.params.patientId,
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
