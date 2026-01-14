const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const { canModifyPatientData } = require("../middleware/permissions");
const medsCtrl = require("../controllers/medications");

router.get(
  "/patients/:patientId/medications",
  verifyToken,
  canModifyPatientData,
  medsCtrl.getMedications
);

router.post(
  "/patients/:patientId/medications",
  verifyToken,
  canModifyPatientData,
  medsCtrl.createMedication
);

router.put("/medications/:id", verifyToken, medsCtrl.updateMedication);

router.delete("/medications/:id", verifyToken, medsCtrl.deleteMedication);

module.exports = router;
