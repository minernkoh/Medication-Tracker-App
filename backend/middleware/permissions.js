const User = require("../models/User");
const {
  canModifyPatientData: canModifyPatientDataAuth,
  canViewPatientData: canViewPatientDataAuth,
} = require("../utils/auth");

const canModifyPatientData = async (req, res, next) => {
  const patient = await User.findById(req.params.patientId || req.body.patient);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const access = canModifyPatientDataAuth(req.user, patient);
  if (!access.authorized) {
    return res.status(403).json({ message: access.message });
  }

  return next();
};

const canViewPatientData = async (req, res, next) => {
  const patient = await User.findById(req.params.patientId || req.body.patient);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const access = canViewPatientDataAuth(req.user, patient);
  if (!access.authorized) {
    return res.status(403).json({ message: access.message });
  }

  return next();
};
module.exports = { canModifyPatientData, canViewPatientData };
