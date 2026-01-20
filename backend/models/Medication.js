const mongoose = require("mongoose");

const TIME_OF_DAY_WORDS = ["morning", "afternoon", "night"];
const TIME_24H_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const isValidTimeOfDay = (v) => {
  if (v === null || v === undefined || v === "") return true;
  if (typeof v !== "string") return false;
  const normalized = v.trim().toLowerCase();
  return TIME_OF_DAY_WORDS.includes(normalized) || TIME_24H_RE.test(v);
};

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: Number, required: true },
    unit: { type: String, default: "pills" },
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
          return isValidTimeOfDay(v);
        },
        message:
          "timeOfDay must be one of morning/afternoon/night or a HH:MM 24-hour time",
      },
    },
    timesOfDay: {
      type: [String],
      default: undefined,
      validate: {
        validator: function (arr) {
          if (arr === null || arr === undefined) return true;
          if (!Array.isArray(arr)) return false;
          return arr.every(isValidTimeOfDay);
        },
        message:
          "timesOfDay entries must be one of morning/afternoon/night or a HH:MM 24-hour time",
      },
    },
    // Frontend supply tracking expects these fields to persist.
    taken: { type: Boolean, default: false },
    takenTime: String, // e.g., "9:00 AM"
    frequency: String, // e.g., "2 times per day", "Every 4 hours"
    quantity: { type: Number }, // Current amount remaining
    recommendSupply: { type: Number }, // Baseline for supply ratio calculations
    initialQuantity: { type: Number }, // Baseline for supply %
    additionalInfo: String, // e.g., "Before Meal"
    pillColor: String, // Hex color code
    instructions: [String], // Array of instruction strings
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Medication", medicationSchema);
