const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const errorHandler = require("./middleware/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const caseRoutes = require("./routes/case.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const consultationRoutes = require("./routes/consultation.routes");
const healthRoutes = require("./routes/health.routes");
const reportRoutes = require("./routes/report.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const aiRoutes = require("./routes/ai.routes");
const auditRoutes = require("./routes/audit.routes");

const app = express();

// Security Headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false
    })
);

// CORS
const corsOrigin = process.env.CLIENT_URL || "*";
app.use(
    cors({
        origin: corsOrigin,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again later." }
});
app.use("/api/", limiter);

// Body Parsers
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static uploads folder for diagnostic reports
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve frontend static files if running monolithic server
app.use(express.static(path.join(__dirname, "../../")));

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        application: "SWASTHAI API Server",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

// API Routes Mounting
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/health-readings", healthRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/audit", auditRoutes);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
