const express = require("express");
const router = express.Router();
const caseController = require("../controllers/case.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.get("/", optionalAuth, caseController.getCases);
router.get("/history", optionalAuth, caseController.getCases);
router.post("/", optionalAuth, caseController.createCase);
router.get("/:id", optionalAuth, caseController.getCaseById);
router.put("/:id", optionalAuth, caseController.updateCase);

// Practitioner Review Workspace Actions
router.get("/:caseId/review", optionalAuth, caseController.getCaseReview);
router.put("/:caseId/verification", optionalAuth, caseController.updateVerification);
router.post("/:caseId/notes", optionalAuth, caseController.addClinicalNotes);
router.post("/:caseId/finalize", optionalAuth, caseController.finalizeCase);
router.post("/:caseId/timeline", optionalAuth, caseController.addTimelineEvent);
router.post("/:caseId/followup", optionalAuth, caseController.scheduleFollowup);

module.exports = router;
