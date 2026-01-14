const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: String,
    dosage: String,
    frequency: String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
