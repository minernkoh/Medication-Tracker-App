const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const {
  canModifyPatientData,
  canViewPatientData,
} = require("../middleware/permissions");
const medsCtrl = require("../controllers/medications");

router.get(
  "/patients/:patientId/medications",
  verifyToken,
  canViewPatientData,
  medsCtrl.getMedications
);

// Current patient's medications
router.get("/medications", verifyToken, medsCtrl.getMedications);

router.post(
  "/patients/:patientId/medications",
  verifyToken,
  canModifyPatientData,
  medsCtrl.createMedication
);

// Create medication for current patient
router.post("/medications", verifyToken, medsCtrl.createMedication);

router.put(
  "/patients/:patientId/medications/:id",
  verifyToken,
  canModifyPatientData,
  medsCtrl.updateMedication
);

router.delete(
  "/patients/:patientId/medications/:id",
  verifyToken,
  canModifyPatientData,
  medsCtrl.deleteMedication
);

router.get("/medications/:id", verifyToken, medsCtrl.getMedicationById);

router.put("/medications/:id", verifyToken, medsCtrl.updateMedication);

router.delete("/medications/:id", verifyToken, medsCtrl.deleteMedication);

module.exports = router;
