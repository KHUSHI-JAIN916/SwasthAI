const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.post("/analyze-case", optionalAuth, aiController.analyzeCase);
router.post("/generate-summary", optionalAuth, aiController.generateSummary);
router.post("/suggest-questions", optionalAuth, aiController.suggestQuestions);
router.post("/red-flags", optionalAuth, aiController.analyzeCase);
router.post("/missing-information", optionalAuth, aiController.analyzeCase);
router.post("/allergy-check", optionalAuth, aiController.analyzeCase);
router.post("/assistant", optionalAuth, aiController.assistant);
router.post("/consultation-notes", optionalAuth, aiController.generateConsultationNotes);

module.exports = router;
