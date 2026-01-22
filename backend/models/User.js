/**
 * User model (MongoDB / Mongoose)
 *
 * Stores both patient and caregiver accounts.
 * Key fields:
 * - `role`: "patient" | "caregiver"
 * - `caregivers`: array of linked caregiver user ids (preferred)
 * - `caregiver`: legacy single caregiver field (still supported)
 *
 * Key behavior:
 * - Password hashing happens automatically in `pre("save")`.
 * - `comparePassword()` verifies login credentials.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "caregiver"], required: true },
  caregivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  caregiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
