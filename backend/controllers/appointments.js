const Appointment = require("../models/Appointments");
const User = require("../models/User");

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
    const appts = await Appointment.find({ patient: req.params.patientId });
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

    const isPatient = req.user.id === patient.id;
    const isCaregiver =
      req.user.role === "caregiver" &&
      patient.caregiver?.toString() === req.user.id;

    if (!isPatient && !isCaregiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const patient = await User.findById(req.params.patientId);
    if (patient && patient.caregiver && req.user.id === patient.id) {
      return res.status(403).json({ message: "Patient has read only access" });
    }

    processAppointmentDate(req.body);

    const appt = await Appointment.create({
      ...req.body,
      patient: req.params.patientId,
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

    const isPatient = req.user.id === patient.id;
    const isCaregiver =
      req.user.role === "caregiver" &&
      patient.caregiver?.toString() === req.user.id;

    if (isPatient && patient.caregiver) {
      return res.status(403).json({ message: "Patient has read only access" });
    }

    if (!isPatient && !isCaregiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    processAppointmentDate(req.body);

    delete req.body.patient;
    delete req.body.createdBy;

    const updatedAppt = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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
    const isPatient = req.user.id === patient.id;
    const isCaregiver =
      req.user.role === "caregiver" &&
      patient.caregiver?.toString() === req.user.id;

    if (isPatient && patient.caregiver) {
      return res.status(403).json({ message: "Patient has read only access" });
    }

    if (!isPatient && !isCaregiver) {
      return res.status(403).json({ message: "Not authorized" });
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
