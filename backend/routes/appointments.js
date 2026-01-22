/**
 * Appointment routes
 *
 * Base path (mounted in `server.js`): `/api`
 * Supports both:
 * - Current patient endpoints (`/appointments`)
 * - Caregiver patient-scoped endpoints (`/patients/:patientId/appointments`)
 */

const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const {
  canModifyPatientData,
  canViewPatientData,
} = require("../middleware/permissions");
const apptCtrl = require("../controllers/appointments");

router.get(
  "/patients/:patientId/appointments",
  verifyToken,
  canViewPatientData,
  apptCtrl.getAppointments
);

router.get("/appointments", verifyToken, apptCtrl.getAppointments);

router.post(
  "/patients/:patientId/appointments",
  verifyToken,
  canModifyPatientData,
  apptCtrl.createAppointment
);

router.post("/appointments", verifyToken, apptCtrl.createAppointment);

router.get(
  "/patients/:patientId/appointments/:id",
  verifyToken,
  canViewPatientData,
  apptCtrl.getAppointmentById
);

router.put(
  "/patients/:patientId/appointments/:id",
  verifyToken,
  canModifyPatientData,
  apptCtrl.updateAppointment
);

router.delete(
  "/patients/:patientId/appointments/:id",
  verifyToken,
  canModifyPatientData,
  apptCtrl.deleteAppointment
);

router.get("/appointments/:id", verifyToken, apptCtrl.getAppointmentById);
router.put("/appointments/:id", verifyToken, apptCtrl.updateAppointment);
router.delete("/appointments/:id", verifyToken, apptCtrl.deleteAppointment);

module.exports = router;
