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

  if (user.role === "patient" && user.caregiver && req.user.id === user.id) {
    return res.status(403).json({ message: "Read-only access" });
  }

  if (req.user.id !== user.id && user.caregiver?.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updates = { ...req.body };
  delete updates.role;
  delete updates.caregiver;
  delete updates.password;

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

  patient.caregiver = caregiver ? caregiver._id : null;
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
      return res.status(403).json({ message: "Not authorized to delete this account" });
    }

    // If user is a caregiver, remove caregiver reference from all patients
    if (user.role === "caregiver") {
      await User.updateMany(
        { caregiver: userId },
        { $unset: { caregiver: "" } }
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

module.exports = {
  getCurrentUser,
  updateUser,
  assignCaregiver,
  deleteUser,
};
