const User = require("../models/User");

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

module.exports = {
  getCurrentUser,
  updateUser,
  assignCaregiver,
};
