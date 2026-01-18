const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
    },
    location: { type: String },
    date: { type: Date },
    time: {
      type: String,
    },
    notes: String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
