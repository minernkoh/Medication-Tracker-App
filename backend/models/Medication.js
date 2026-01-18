const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "pills",
        "tablets",
        "capsules",
        "liquid",
        "drops",
        "spray",
        "injection",
        "patch",
        "cream",
        "ointment",
        "gel",
        "powder",
        "inhaler",
      ],
      default: "pills",
    },
    status: {
      type: String,
      enum: ["pending", "taken", "supply"],
      default: "supply",
    },
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "night", null],
      default: null,
    },
    timesOfDay: {
      type: [String],
      enum: ["morning", "afternoon", "night"],
      default: undefined,
    },
    takenTime: String, // e.g., "9:00 AM"
    frequency: String, // e.g., "2 times per day", "Every 4 hours"
    quantity: String, // e.g., "30 pills"
    refillDate: String, // e.g., "2026-02-15"
    additionalInfo: String, // e.g., "Before Meal"
    pillColor: String, // Hex color code
    instructions: [String], // Array of instruction strings
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Medication", medicationSchema);
