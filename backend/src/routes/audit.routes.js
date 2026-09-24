const express = require("express");
const router = express.Router();
const auditController = require("../controllers/audit.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.get("/", optionalAuth, auditController.getAuditLogs);
router.post("/", optionalAuth, auditController.createAuditLog);

module.exports = router;
