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

// Extra endpoints used by the frontend API helper
router.get("/medications/today", verifyToken, medsCtrl.getMedicationsDueToday);
router.get("/medications/supply", verifyToken, medsCtrl.getMedicationSupply);
router.get(
  "/medications/date/:date",
  verifyToken,
  medsCtrl.getMedicationsForDate
);

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

router.patch("/medications/:id/taken", verifyToken, medsCtrl.markMedicationAsTaken);
router.patch("/medications/:id/undo", verifyToken, medsCtrl.undoMarkAsTaken);

router.get("/medications/:id", verifyToken, medsCtrl.getMedicationById);

router.put("/medications/:id", verifyToken, medsCtrl.updateMedication);

router.delete("/medications/:id", verifyToken, medsCtrl.deleteMedication);

module.exports = router;
