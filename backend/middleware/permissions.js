/**
 * Permissions middleware (patient/caregiver access)
 *
 * Loads the target patient record and enforces authorization rules:
 * - Patients can view their own data
 * - Caregivers can view/modify linked patients
 * - Linked patients become "read-only" for modifications
 *
 * These checks are implemented in `backend/utils/auth.js`.
 */

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
