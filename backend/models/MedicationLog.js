/**
 * MedicationLog model (MongoDB / Mongoose)
 *
 * This is the app's "intake history" table.
 * One record represents: a patient took a specific medication for a specific
 * date and time-slot.
 *
 * The unique index `(medication, date, timeSlot)` prevents duplicate logs for
 * the same slot.
 */

const mongoose = require("mongoose");

const medicationLogSchema = new mongoose.Schema(
  {
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
medicationLogSchema.index({ medication: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model("MedicationLog", medicationLogSchema);
