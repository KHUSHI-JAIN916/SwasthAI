const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");

const JWT_SECRET = process.env.JWT_SECRET || "swasthai_dev_secret_replace_in_production";

/**
 * Require valid JWT authentication token
 */
const requireAuth = async (req, res, next) => {
    try {
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please provide a valid token."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again."
        });
    }
};

/**
 * Optional authentication: attaches user if token is present, does not fail if absent
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
    } catch (err) {
        // Continue without req.user
    }
    next();
};

/**
 * Require specific user role(s)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!roles.includes(req.user.role) && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of roles: [${roles.join(", ")}]. Current role: ${req.user.role}`
            });
        }
        next();
    };
};

const requirePractitioner = requireRole("practitioner", "admin");
const requirePatient = requireRole("patient", "admin");
const requireAdmin = requireRole("admin");

/**
 * Validate that a patient user is only requesting their own records
 */
const requirePatientOwnership = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
    }

    // Practitioners and Admins can access any patient
    if (req.user.role === "practitioner" || req.user.role === "admin") {
        return next();
    }

    const requestedPatientId = req.params.patientId || req.params.id || req.body.patientId || req.query.patientId;
    const userPatientId = req.user.patientId || req.user.id;

    if (requestedPatientId && userPatientId && requestedPatientId.toLowerCase() !== userPatientId.toLowerCase()) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You are not authorized to view or modify another patient's medical records."
        });
    }

    next();
};

module.exports = {
    requireAuth,
    optionalAuth,
    requireRole,
    requirePractitioner,
    requirePatient,
    requireAdmin,
    requirePatientOwnership
};
