const mongoose = require("mongoose");

const TIME_OF_DAY_WORDS = ["morning", "afternoon", "night"];
const TIME_24H_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    // Accept either coarse buckets ("morning") or a precise time ("09:30").
    // Frontend uses both representations in different places.
    timeOfDay: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined || v === "") return true;
          if (typeof v !== "string") return false;
          const normalized = v.trim().toLowerCase();
          return TIME_OF_DAY_WORDS.includes(normalized) || TIME_24H_RE.test(v);
        },
        message:
          "timeOfDay must be one of morning/afternoon/night or a HH:MM 24-hour time",
      },
    },
    timesOfDay: {
      type: [String],
      enum: ["morning", "afternoon", "night"],
      default: undefined,
    },
    // Frontend supply tracking expects these fields to persist.
    taken: { type: Boolean, default: false },
    takenTime: String, // e.g., "9:00 AM"
    frequency: String, // e.g., "2 times per day", "Every 4 hours"
    quantity: String, // e.g., "30 pills"
    initialQuantity: String, // e.g., "30 pills" (baseline for supply %)
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
