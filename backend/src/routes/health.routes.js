const express = require("express");
const router = express.Router();
const healthController = require("../controllers/health.controller");
const { requireAuth, optionalAuth, requirePatientOwnership } = require("../middleware/auth.middleware");

// GET readings for a patient — optional auth (works for demo, enforces ownership when logged in)
router.get("/", optionalAuth, healthController.getHealthReadings);

// GET summary for a patient
router.get("/summary/:patientId", optionalAuth, healthController.getHealthSummary);

// GET trends for a patient
router.get("/trends/:patientId", optionalAuth, healthController.getHealthTrends);

// GET readings for a specific patient by ID
router.get("/:patientId", optionalAuth, healthController.getHealthReadings);

// POST — save new health reading (requires auth for production, optional for demo)
router.post("/", optionalAuth, healthController.saveHealthReading);

// PUT — update an existing health reading
router.put("/:id", optionalAuth, healthController.updateHealthReading);

// DELETE — delete a health reading (requires auth)
router.delete("/:id", requireAuth, healthController.deleteHealthReading);

module.exports = router;
