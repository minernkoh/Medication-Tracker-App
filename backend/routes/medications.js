/**
 * Medication routes
 *
 * Base path (mounted in `server.js`): `/api`
 * Highlights:
 * - Patient-scoped endpoints: `/patients/:patientId/medications`
 * - Daily views: `/medications?date=YYYY-MM-DD` and `/medications?status=pending|taken`
 * - Intake actions: `PATCH /medications/:id/taken` and `/medications/:id/undo`
 */

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

router.get("/medications", verifyToken, medsCtrl.getMedications);

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
