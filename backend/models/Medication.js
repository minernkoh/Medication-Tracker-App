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
    status: {
      type: String,
      enum: ["pending", "taken", "supply"],
      default: "supply",
    },
    additionalInfo: String,
    pillColor: String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
