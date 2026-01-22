/**
 * Authorization helpers (backend)
 *
 * Centralizes the "who can access which patient" rules.
 * Key behavior:
 * - A caregiver can access patients that list them in `caregivers` (or legacy `caregiver`).
 * - A patient can access their own data.
 * - If a patient is linked to a caregiver, they become **read-only** for write operations.
 */

const checkPatientAccess = (reqUser, patient, requireModify = false) => {
  if (!reqUser || !patient) {
    return { authorized: false, message: "Invalid request" };
  }

  const currentUserId = reqUser.id?.toString();

  const patientId = patient.id || patient._id?.toString();
  const isPatient =
    currentUserId === patientId || currentUserId === patient._id?.toString();

  const caregiverIds =
    patient.caregivers
      ?.filter(Boolean)
      .map((c) => (c._id ? c._id.toString() : c.toString())) || [];
  const legacyCaregiverId =
    patient.caregiver?._id?.toString() || patient.caregiver?.toString();

  const isCaregiver =
    reqUser.role === "caregiver" &&
    (caregiverIds.includes(currentUserId) ||
      legacyCaregiverId === currentUserId);

  if (!isPatient && !isCaregiver) {
    return { authorized: false, message: "Not authorized" };
  }

  if (
    requireModify &&
    isPatient &&
    (caregiverIds.length > 0 || legacyCaregiverId)
  ) {
    return { authorized: false, message: "Patient has read only access" };
  }

  return { authorized: true };
};

const canViewPatientData = (reqUser, patient) => {
  return checkPatientAccess(reqUser, patient, false);
};

const canModifyPatientData = (reqUser, patient) => {
  return checkPatientAccess(reqUser, patient, true);
};

module.exports = {
  checkPatientAccess,
  canViewPatientData,
  canModifyPatientData,
};
