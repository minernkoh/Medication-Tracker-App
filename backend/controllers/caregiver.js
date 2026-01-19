const User = require("../models/User");
const Medication = require("../models/Medication");
const MedicationLog = require("../models/MedicationLog");
const Appointment = require("../models/Appointments");

const getTodayStr = () => new Date().toISOString().split("T")[0];

const isScheduledMedication = (med) => {
  if (!med) return false;
  if (med.timeOfDay) return true;
  if (Array.isArray(med.timesOfDay) && med.timesOfDay.length > 0) return true;
  return false;
};

const getPatients = async (req, res) => {
  try {
    // Find all patients assigned to this caregiver
    const patients = await User.find({ caregiver: req.user.id }).select(
      "-password"
    );
    const today = getTodayStr();

    // Aggregate data for each patient to populate the dashboard
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const patientObj = patient.toObject();
        patientObj.id = patient._id; // Ensure ID is available as 'id'

        // 1. Get Medications Stats
        const meds = await Medication.find({ patient: patient._id });
        const totalMeds = meds.length;
        const takenMeds = meds.filter(
          (m) => m.status === "taken" || m.taken
        ).length;

        // Today's adherence: scheduled meds + logs
        const scheduledMeds = meds.filter(isScheduledMedication);
        const medicationsTotalToday = scheduledMeds.length;
        const logs = await MedicationLog.find({
          patient: patient._id,
          date: today,
        }).select("medication");
        const takenTodayIds = new Set(logs.map((l) => l.medication.toString()));
        const medicationsTakenToday = scheduledMeds.filter((m) =>
          takenTodayIds.has(m._id.toString())
        ).length;

        // Calculate adherence rate
        const adherenceRate =
          totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

        // Check for low supply alerts
        const alerts = meds.filter((m) => {
          const qty = Number(m.quantity);
          return Number.isFinite(qty) && qty < 10; // Low supply threshold
        }).length;

        // 2. Get Next Appointment
        const now = new Date();
        // Get all appointments for this patient, sorted by date
        const allAppointments = await Appointment.find({
          patient: patient._id,
        })
          .sort({ date: 1, time: 1 });

        let nextAppointment = null;
        // Find the first appointment that is in the future
        for (const apt of allAppointments) {
          const aptDate = new Date(apt.date);
          if (!aptDate || isNaN(aptDate.getTime())) continue;
          
          // Create a date-time object for the appointment
          const aptDateTime = new Date(aptDate);
          if (apt.time) {
            const [hours, minutes] = apt.time.split(":").map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              aptDateTime.setHours(hours, minutes, 0, 0);
            }
          }
          
          // Only include if the appointment is in the future
          if (aptDateTime > now) {
            nextAppointment = {
              title: apt.title,
              date: aptDate.toLocaleDateString(),
              time: apt.time,
            };
            break; // Found the next appointment, stop searching
          }
        }

        return {
          ...patientObj,
          medicationsTotal: totalMeds,
          medicationsTaken: takenMeds,
          medicationsTotalToday,
          medicationsTakenToday,
          adherenceRate,
          alerts,
          nextAppointment,
        };
      })
    );

    res.json(patientsWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPatient = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find existing patient by email
    const patient = await User.findOne({ email: email.trim().toLowerCase() });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found. The patient must have an existing account." });
    }

    // Verify the user is a patient
    if (patient.role !== "patient") {
      return res.status(400).json({ message: "The email provided does not belong to a patient account." });
    }

    // Check if patient already has a caregiver
    if (patient.caregiver && patient.caregiver.toString() !== req.user.id) {
      return res.status(400).json({ message: "This patient is already linked to another caregiver." });
    }

    // Link patient to caregiver (or update if already linked)
    patient.caregiver = req.user.id;
    await patient.save();

    const patientObj = patient.toObject();
    delete patientObj.password;
    patientObj.id = patientObj._id;

    // Get stats for this patient
    const meds = await Medication.find({ patient: patient._id });
    const totalMeds = meds.length;
    const takenMeds = meds.filter((m) => m.status === "taken" || m.taken).length;
    const today = getTodayStr();
    const scheduledMeds = meds.filter(isScheduledMedication);
    const medicationsTotalToday = scheduledMeds.length;
    const logs = await MedicationLog.find({
      patient: patient._id,
      date: today,
    }).select("medication");
    const takenTodayIds = new Set(logs.map((l) => l.medication.toString()));
    const medicationsTakenToday = scheduledMeds.filter((m) =>
      takenTodayIds.has(m._id.toString())
    ).length;
    const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
    const alerts = meds.filter((m) => {
      const qty = Number(m.quantity);
      return Number.isFinite(qty) && qty < 10;
    }).length;

    const allAppointments = await Appointment.find({ patient: patient._id })
      .sort({ date: 1, time: 1 });

    let nextAppointment = null;
    const now = new Date();
    for (const appt of allAppointments) {
      const apptDate = new Date(`${appt.date}T${appt.time || "00:00"}`);
      if (apptDate >= now) {
        nextAppointment = {
          date: appt.date,
          time: appt.time,
        };
        break;
      }
    }

    // Return with stats structure
    res.status(200).json({
      ...patientObj,
      medicationsTotal: totalMeds,
      medicationsTaken: takenMeds,
      medicationsTotalToday,
      medicationsTakenToday,
      adherenceRate,
      alerts,
      nextAppointment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    // Verify the patient belongs to this caregiver before deleting
    const patient = await User.findOne({
      _id: req.params.id,
      caregiver: req.user.id,
    });
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found or not authorized" });
    }

    // Delete the user and associated data
    await User.findByIdAndDelete(req.params.id);
    await Medication.deleteMany({ patient: req.params.id });
    await Appointment.deleteMany({ patient: req.params.id });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await User.findOne({
      _id: req.params.id,
      caregiver: req.user.id,
    }).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const medications = await Medication.find({ patient: patient._id });
    const appointments = await Appointment.find({ patient: patient._id }).sort({
      date: 1,
    });

    res.json({ ...patient.toObject(), medications, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    // Find all patients for this caregiver
    const patients = await User.find({ caregiver: req.user.id }).select("_id");
    const patientIds = patients.map((p) => p._id);

    // Find all appointments for these patients
    const appointments = await Appointment.find({
      patient: { $in: patientIds },
    })
      .populate("patient", "name nickname color initials")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPatients,
  addPatient,
  deletePatient,
  getPatientById,
  getAllAppointments,
};
