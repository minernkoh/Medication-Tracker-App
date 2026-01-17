const User = require("../models/User");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointments");

const getPatients = async (req, res) => {
  try {
    // Find all patients assigned to this caregiver
    const patients = await User.find({ caregiver: req.user.id }).select(
      "-password"
    );

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

        // Calculate adherence rate
        const adherenceRate =
          totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

        // Check for low supply alerts
        const alerts = meds.filter((m) => {
          const qty = parseInt(m.quantity) || 0;
          return qty < 10; // Low supply threshold
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
    // Create a managed user account
    // Since email/password are required by schema, we generate placeholders
    // In a real app, this might trigger an email invitation
    const timestamp = Date.now();
    const generatedEmail = `patient_${timestamp}_${Math.floor(
      Math.random() * 1000
    )}@medtracker.local`;
    const generatedPassword = "managed_account_placeholder";

    const newPatient = await User.create({
      name: req.body.name,
      email: generatedEmail,
      password: generatedPassword,
      role: "patient",
      caregiver: req.user.id,
      // Profile fields
      nickname: req.body.nickname,
      phone: req.body.phone,
      relationship: req.body.relationship,
      color: req.body.color,
      initials: req.body.initials,
    });

    const patientObj = newPatient.toObject();
    delete patientObj.password;
    patientObj.id = patientObj._id;

    // Return with empty stats structure
    res.status(201).json({
      ...patientObj,
      medicationsTotal: 0,
      medicationsTaken: 0,
      adherenceRate: 0,
      alerts: 0,
      nextAppointment: null,
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
