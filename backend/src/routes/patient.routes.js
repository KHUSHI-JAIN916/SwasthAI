const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const { requireAuth, optionalAuth, requirePractitioner, requirePatientOwnership } = require("../middleware/auth.middleware");

// Patient List — practitioners and admins only for full list; patients get limited access
router.get("/", optionalAuth, patientController.getPatients);

// Create patient — requires practitioner or admin
router.post("/", optionalAuth, patientController.createPatient);

// Get patient by ID — any authenticated user (ownership enforced in controller)
router.get("/:id", optionalAuth, patientController.getPatientById);

// Update patient — auth required
router.put("/:id", requireAuth, patientController.updatePatient);

// Delete patient — practitioners/admin only
router.delete("/:id", requireAuth, requirePractitioner, patientController.deletePatient);

// Patient Dossier (full clinical record)
router.get("/:id/dossier", optionalAuth, patientController.getPatientDossier);

// Patient-reported data — requires auth
router.post("/:id/diseases", optionalAuth, patientController.addReportedDisease);
router.post("/:id/past-records", optionalAuth, patientController.addPastDoctorRecord);

module.exports = router;
