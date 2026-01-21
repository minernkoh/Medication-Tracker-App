/**
 * Caregiver routes
 *
 * Base path (mounted in `server.js`): `/api`
 * Provides caregiver-only views:
 * - linked patients
 * - combined schedule (per day)
 * - combined appointments list
 */

const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const caregiverCtrl = require("../controllers/caregiver");

router.get("/caregiver/patients", verifyToken, caregiverCtrl.getPatients);

router.get(
  "/caregiver/appointments",
  verifyToken,
  caregiverCtrl.getAllAppointments,
);

router.get("/caregiver/schedule", verifyToken, caregiverCtrl.getSchedule);

router.get(
  "/caregiver/patients/:id",
  verifyToken,
  caregiverCtrl.getPatientById,
);

router.post("/caregiver/patients", verifyToken, caregiverCtrl.addPatient);

router.delete(
  "/caregiver/patients/:id",
  verifyToken,
  caregiverCtrl.deletePatient,
);

module.exports = router;
