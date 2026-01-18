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
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    timeSlot: {
      type: String, // e.g., "morning", "afternoon", "night", or specific time
      required: true,
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique log per medication per date per timeSlot
medicationLogSchema.index({ medication: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model("MedicationLog", medicationLogSchema);
