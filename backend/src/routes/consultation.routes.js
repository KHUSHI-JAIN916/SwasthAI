const express = require("express");
const router = express.Router();
const consultationController = require("../controllers/consultation.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.get("/", optionalAuth, consultationController.getConsultations);
router.post("/", optionalAuth, consultationController.saveConsultation);
router.get("/:id", optionalAuth, consultationController.getConsultationById);
router.delete("/:id", optionalAuth, consultationController.deleteConsultation);

module.exports = router;
