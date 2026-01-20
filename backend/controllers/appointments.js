const Appointment = require("../models/Appointments");
const User = require("../models/User");
const { checkPatientAccess } = require("../utils/auth");

const pad2 = (value) => String(value).padStart(2, "0");

const toLocalDateString = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const toLocalTimeString = (d) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const processAppointmentDate = (reqBody) => {
  const { date } = reqBody;
  if (!date) return;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const applyFromDate = (d, setTime = false) => {
    if (!d || Number.isNaN(d.getTime())) return false;
    reqBody.date = toLocalDateString(d);
    if (setTime && !reqBody.time) {
      reqBody.time = toLocalTimeString(d);
    }
    reqBody.day = days[d.getDay()];
    return true;
  };

  if (date instanceof Date) {
    applyFromDate(date, true);
    return;
  }

  if (typeof date === "string") {
    if (date.includes("GMT")) {
      const d = new Date(date);
      if (applyFromDate(d, true)) return;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const d = new Date(`${date}T00:00:00`);
      if (applyFromDate(d, false)) return;
    }

    if (date.includes("T")) {
      const d = new Date(date);
      if (applyFromDate(d, true)) return;
    }
  }

  const fallback = new Date(date);
  applyFromDate(fallback, true);
};

const getAppointments = async (req, res) => {
  try {
    if (req.params.patientId) {
      const patient = await User.findById(req.params.patientId);
      if (!patient)
        return res.status(404).json({ message: "Patient not found" });
      const access = checkPatientAccess(req.user, patient, false);
      if (!access.authorized)
        return res.status(403).json({ message: access.message });

      const appts = await Appointment.find({ patient: req.params.patientId });
      return res.json(appts);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "caregiver") {
      return res.json([]);
    }
    const appts = await Appointment.find({ patient: req.user.id });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.params.patientId &&
      appt.patient.toString() !== req.params.patientId
    ) {
      return res.status(400).json({
        message: "Appointment does not belong to the specified patient",
      });
    }

    const patient = await User.findById(appt.patient);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const access = checkPatientAccess(req.user, patient, false);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "MongoDB not connected. Connection state:",
        mongoose.connection.readyState,
      );
      return res.status(503).json({ message: "Database not connected" });
    }

    const patientId = req.params.patientId || req.body.patient || req.user.id;
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    processAppointmentDate(req.body);

    const appt = await Appointment.create({
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
    });

    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.params.patientId &&
      appt.patient.toString() !== req.params.patientId
    ) {
      return res.status(400).json({
        message: "Appointment does not belong to the specified patient",
      });
    }

    const patient = await User.findById(appt.patient);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    processAppointmentDate(req.body);

    delete req.body.patient;
    delete req.body.createdBy;

    const updatedAppt = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedAppt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.params.patientId &&
      appt.patient.toString() !== req.params.patientId
    ) {
      return res.status(400).json({
        message: "Appointment does not belong to the specified patient",
      });
    }

    const patient = await User.findById(appt.patient);

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
