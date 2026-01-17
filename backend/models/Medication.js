const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String },
    dosage: { type: String },
    frequency: String,
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "night", null],
      default: null,
    },
    time: { type: String }, // Time in HH:MM format
    status: {
      type: String,
      enum: ["pending", "taken", "supply"],
      default: "supply",
    },
    taken: { type: Boolean, default: false },
    takenTime: { type: String }, // Time when medication was taken (e.g., "9:30 AM")
    quantity: { type: String }, // Medication quantity (e.g., "30 pills")
    additionalInfo: String,
    pillColor: String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
