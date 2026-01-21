/**
 * Users controller
 *
 * User profile endpoints:
 * - `GET /users/me`: current user profile (caregiver links included)
 * - `PUT /users/:id`: update profile (patients linked to caregivers are read-only)
 * - `PUT /users/:id/assign-caregiver`: link a caregiver to a patient account
 * - `POST /users/me/change-password`
 * - `DELETE /users/:id`: delete account and related data
 */

const User = require("../models/User");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointments");
const MedicationLog = require("../models/MedicationLog");

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("caregivers", "name email role")
    // Support legacy single-caregiver field too (so UI can show a name, not an ObjectId).
    .populate("caregiver", "name email role");
  res.json(user);
};

const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPatientReadOnly =
    user.role === "patient" &&
    (user.caregivers?.length > 0 || user.caregiver) &&
    req.user.id === user.id;

  if (
    req.user.id !== user.id &&
    !(
      user.caregivers?.some((id) => id.toString() === req.user.id) ||
      user.caregiver?.toString() === req.user.id
    )
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updates = { ...req.body };
  delete updates.role;
  delete updates.caregivers;

  if (!updates.password) {
    delete updates.password;
  }

  if (isPatientReadOnly) {
    const allowedFields = ["name"];
    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key] !== undefined,
    );
    const hasDisallowedFields = updateKeys.some(
      (key) => !allowedFields.includes(key),
    );

    if (hasDisallowedFields) {
      return res.status(403).json({ message: "Read-only access" });
    }
  }

  Object.assign(user, updates);
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  res.json(userObj);
};

const assignCaregiver = async (req, res) => {
  const patient = await User.findById(req.params.id);
  const caregiver = req.body.caregiverId
    ? await User.findById(req.body.caregiverId)
    : null;

  if (!patient || (req.body.caregiverId && !caregiver)) {
    return res.status(404).json({ message: "User or Caregiver not found" });
  }

  if (
    patient.role !== "patient" ||
    (caregiver && caregiver.role !== "caregiver")
  ) {
    return res.status(400).json({ message: "Invalid roles" });
  }

  if (caregiver) {
    if (typeof patient.caregivers.addToSet === "function") {
      patient.caregivers.addToSet(caregiver._id);
    } else if (!patient.caregivers.includes(caregiver._id)) {
      patient.caregivers.push(caregiver._id);
    }
  }
  await patient.save();

  const patientObj = patient.toObject();
  delete patientObj.password;
  res.json(patientObj);
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this account" });
    }
    if (user.role === "caregiver") {
      await User.updateMany(
        { caregivers: userId },
        { $pull: { caregivers: userId } },
      );
      await User.updateMany(
        { caregiver: userId },
        { $unset: { caregiver: "" } },
      );
    }
    await Medication.deleteMany({ patient: userId });
    await Appointment.deleteMany({ patient: userId });
    await MedicationLog.deleteMany({ patient: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCurrentUser,
  updateUser,
  assignCaregiver,
  deleteUser,
  changePassword,
};
