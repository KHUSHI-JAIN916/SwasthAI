const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const upload = require("../middleware/upload.middleware");
const { optionalAuth } = require("../middleware/auth.middleware");

router.post("/upload", optionalAuth, upload.single("file"), reportController.uploadReport);
router.get("/", optionalAuth, reportController.getReports);
router.get("/patient/:patientId", optionalAuth, reportController.getReports);
router.get("/download/:id", reportController.downloadReportFile);
router.get("/:id", optionalAuth, reportController.getReportById);
router.delete("/:id", optionalAuth, reportController.deleteReport);

module.exports = router;
