const Appointment = require("../models/Appointments");
const User = require("../models/User");
const { checkPatientAccess } = require("../utils/auth");

const processAppointmentDate = (reqBody) => {
  const { date } = reqBody;
  if (!date) return;

  if (typeof date === "string" && date.includes("GMT")) {
    const parts = date.split(" ");
    if (parts.length >= 5) {
      const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const month = months[parts[1]];
      const dayStr = parts[2];
      const year = parts[3];
      const time = parts[4].substring(0, 5);

      if (month && dayStr && year) {
        reqBody.date = `${year}-${month}-${dayStr}`;
        reqBody.time = time;

        const d = new Date(`${year}-${month}-${dayStr}`);
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        reqBody.day = days[d.getUTCDay()];
        return;
      }
    }
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) return;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  reqBody.day = days[d.getDay()];

  if (date.includes("T")) {
    reqBody.date = d.toISOString().split("T")[0];
    reqBody.time = d.toISOString().split("T")[1].substring(0, 5);
  }
};

const getAppointments = async (req, res) => {
  try {
    // If patientId is provided in params, use it (for caregiver viewing patient data)
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

    // If no patientId, check if the user is a caregiver
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user is a caregiver, they shouldn't have their own appointments
    // Return empty array or only appointments for their patients
    if (user.role === "caregiver") {
      // Caregivers should use /caregiver/appointments endpoint
      // Return empty array here to prevent showing wrong appointments
      return res.json([]);
    }

    // User is a patient, return their appointments
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

    // Ensure patientId is declared only once
    const patientId = req.params.patientId || req.body.patient || req.user.id;
    const patient = await User.findById(patientId);
    if (!patient) {
      console.error("Patient not found:", patientId);
      return res.status(404).json({ message: "Patient not found" });
    }

    const access = checkPatientAccess(req.user, patient, true);
    if (!access.authorized) {
      return res.status(403).json({ message: access.message });
    }

    processAppointmentDate(req.body);

    console.log("Creating appointment with data:", {
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
    });

    const appt = await Appointment.create({
      ...req.body,
      patient: patientId,
      createdBy: req.user.id,
    });

    console.log("Appointment created successfully:", appt._id);
    res.status(201).json(appt);
  } catch (err) {
    console.error("Error creating appointment:", err);
    console.error("Error details:", {
      message: err.message,
      name: err.name,
      errors: err.errors,
      stack: err.stack,
    });
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
