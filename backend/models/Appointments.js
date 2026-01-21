/**
 * Appointment model (MongoDB / Mongoose)
 *
 * Stores appointments for patients.
 * Important field:
 * - `dateDay` is the timezone-safe day key ("YYYY-MM-DD") used by the UI.
 */

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
    // Canonical day key for UI + filtering (timezone-safe)
    // Stored as YYYY-MM-DD string.
    dateDay: { type: String, index: true },
    time: {
      type: String,
    },
    notes: String,
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Missed", "Cancelled"],
      default: "Scheduled",
    },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
