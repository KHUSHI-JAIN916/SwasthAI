const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", optionalAuth, authController.logout);
router.get("/me", requireAuth, authController.getMe);

module.exports = router;
