const User = require("../models/User");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointments");

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (
    user.role === "patient" &&
    (user.caregivers?.length > 0 || user.caregiver) &&
    req.user.id === user.id
  ) {
    return res.status(403).json({ message: "Read-only access" });
  }

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

  Object.assign(user, updates);
  await user.save();

  res.json(user);
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

  res.json(patient);
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user can only delete their own account
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this account" });
    }

    // If user is a caregiver, remove caregiver reference from all patients
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

    // If user is a patient with a caregiver, no need to update caregiver
    // (caregiver can still see historical data if needed)

    // Delete all medications associated with this user
    await Medication.deleteMany({ patient: userId });

    // Delete all appointments associated with this user
    await Appointment.deleteMany({ patient: userId });

    // Delete the user account
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
