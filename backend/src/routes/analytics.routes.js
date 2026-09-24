const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.get("/dashboard", optionalAuth, analyticsController.getDashboardMetrics);
router.get("/overview", optionalAuth, analyticsController.getAnalyticsOverview);
router.get("/cases", optionalAuth, analyticsController.getAnalyticsOverview);
router.get("/patients", optionalAuth, analyticsController.getAnalyticsOverview);
router.get("/conditions", optionalAuth, analyticsController.getAnalyticsOverview);
router.get("/insights", optionalAuth, analyticsController.getAiInsights);

module.exports = router;
