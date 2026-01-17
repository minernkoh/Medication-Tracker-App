const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const caregiverCtrl = require("../controllers/caregiver");

// Middleware to ensure user is a caregiver could be added here

router.get("/caregiver/patients", verifyToken, caregiverCtrl.getPatients);

router.get(
  "/caregiver/appointments",
  verifyToken,
  caregiverCtrl.getAllAppointments
);

router.get(
  "/caregiver/patients/:id",
  verifyToken,
  caregiverCtrl.getPatientById
);

router.post("/caregiver/patients", verifyToken, caregiverCtrl.addPatient);

router.delete(
  "/caregiver/patients/:id",
  verifyToken,
  caregiverCtrl.deletePatient
);

module.exports = router;
