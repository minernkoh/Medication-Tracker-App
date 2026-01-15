const User = require("../models/User");

const canModifyPatientData = async (req, res, next) => {
  const patient = await User.findById(req.params.patientId || req.body.patient);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  if (req.user.id === patient.id) {
    if (patient.caregiver) {
      return res.status(403).json({ message: "Patient has read only access" });
    }
    return next();
  }

  if (
    req.user.role === "caregiver" &&
    patient.caregiver?.toString() === req.user.id
  ) {
    return next();
  }

  return res.status(403).json({ message: "Not authorized" });
};

const canViewPatientData = async (req, res, next) => {
  const patient = await User.findById(req.params.patientId || req.body.patient);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  if (req.user.id === patient.id) {
    return next();
  }

  if (
    req.user.role === "caregiver" &&
    patient.caregiver?.toString() === req.user.id
  ) {
    return next();
  }

  return res.status(403).json({ message: "Not authorized" });
};

module.exports = { canModifyPatientData, canViewPatientData };
