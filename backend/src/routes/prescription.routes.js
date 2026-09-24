const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescription.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.post("/", optionalAuth, prescriptionController.createPrescription);
router.get("/patient/:patientId", optionalAuth, prescriptionController.getPrescriptionsForPatient);
router.get("/:id", optionalAuth, prescriptionController.getPrescriptionById);
router.put("/:id", optionalAuth, prescriptionController.updatePrescription);

module.exports = router;
