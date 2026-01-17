/**
 * Authorization Utilities
 * Shared functions for checking user access to patient data
 */

/**
 * Check if user has access to patient data
 * @param {object} reqUser - Request user object (from JWT)
 * @param {object} patient - Patient user object
 * @param {boolean} requireModify - Whether modification access is required (vs read-only)
 * @returns {object} { authorized: boolean, message?: string }
 */
const checkPatientAccess = (reqUser, patient, requireModify = false) => {
  if (!reqUser || !patient) {
    return { authorized: false, message: "Invalid request" };
  }

  // Handle both _id (MongoDB) and id fields
  const patientId = patient.id || patient._id?.toString();
  const isPatient = reqUser.id === patientId || reqUser.id === patient._id?.toString();
  const isCaregiver =
    reqUser.role === "caregiver" &&
    patient.caregiver?.toString() === reqUser.id;

  // Check basic authorization
  if (!isPatient && !isCaregiver) {
    return { authorized: false, message: "Not authorized" };
  }

  // If modification is required, check for read-only restrictions
  if (requireModify && isPatient && patient.caregiver) {
    return { authorized: false, message: "Patient has read only access" };
  }

  return { authorized: true };
};

/**
 * Middleware helper: Check if user can view patient data
 * @param {object} reqUser - Request user object
 * @param {object} patient - Patient user object
 * @returns {object} { authorized: boolean, message?: string }
 */
const canViewPatientData = (reqUser, patient) => {
  return checkPatientAccess(reqUser, patient, false);
};

/**
 * Middleware helper: Check if user can modify patient data
 * @param {object} reqUser - Request user object
 * @param {object} patient - Patient user object
 * @returns {object} { authorized: boolean, message?: string }
 */
const canModifyPatientData = (reqUser, patient) => {
  return checkPatientAccess(reqUser, patient, true);
};

module.exports = {
  checkPatientAccess,
  canViewPatientData,
  canModifyPatientData,
};
