const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const { canModifyPatientData } = require("../middleware/permissions");
const apptCtrl = require("../controllers/appointments");

router.get(
  "/patients/:patientId/appointments",
  verifyToken,
  canModifyPatientData,
  apptCtrl.getAppointments
);

router.post(
  "/patients/:patientId/appointments",
  verifyToken,
  canModifyPatientData,
  apptCtrl.createAppointment
);

router.get(
  "/patients/:patientId/appointments/:id",
  verifyToken,
  canModifyPatientData,
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
