/**
 * Health Reading Validation Helpers
 * Backend-side validation — never trust frontend alone.
 */

const VITAL_RANGES = {
    systolic:  { min: 60,  max: 250, label: "Systolic BP" },
    diastolic: { min: 40,  max: 160, label: "Diastolic BP" },
    bloodSugar:{ min: 20,  max: 800, label: "Blood Sugar" },
    heartRate: { min: 20,  max: 300, label: "Heart Rate" },
    spo2:      { min: 50,  max: 100, label: "SpO2" },
    temperature:{ min: 90, max: 110, label: "Temperature (°F)" },
    weight:    { min: 1,   max: 500, label: "Weight (kg)" }
};

/**
 * Validate a single numeric vital field
 * Returns { valid: true } or { valid: false, message: "..." }
 */
function validateVital(field, value) {
    if (value === undefined || value === null || value === "" || value === "N/A") {
        return { valid: true }; // optional field
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, message: `${VITAL_RANGES[field]?.label || field} must be a valid number.` };
    }

    const range = VITAL_RANGES[field];
    if (range) {
        if (num < range.min || num > range.max) {
            return {
                valid: false,
                message: `${range.label} value ${num} is outside the plausible clinical range (${range.min}–${range.max}).`
            };
        }
    }

    return { valid: true };
}

/**
 * Validate an entire health reading request body.
 * Returns { valid: true, errors: [] } or { valid: false, errors: [...] }
 */
function validateHealthReading(body) {
    const errors = [];

    // Require at least one vital field to be provided
    const vitalFields = ["systolic", "diastolic", "bloodSugar", "heartRate", "spo2", "temperature", "weight"];
    const hasAtLeastOne = vitalFields.some(f => body[f] !== undefined && body[f] !== null && body[f] !== "");

    if (!hasAtLeastOne) {
        errors.push("At least one vital measurement (BP, Sugar, Heart Rate, SpO2, Temperature, or Weight) must be provided.");
    }

    // Validate each vital field
    for (const field of vitalFields) {
        const result = validateVital(field, body[field]);
        if (!result.valid) {
            errors.push(result.message);
        }
    }

    // Validate BP pair — if one is given, both must be given
    const hasSystolic = body.systolic !== undefined && body.systolic !== "";
    const hasDiastolic = body.diastolic !== undefined && body.diastolic !== "";
    if (hasSystolic !== hasDiastolic) {
        errors.push("Both Systolic and Diastolic blood pressure values must be provided together.");
    }

    // Validate date format if provided
    if (body.date && body.date !== "") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.date)) {
            errors.push("Date must be in YYYY-MM-DD format.");
        }
    }

    // Validate sugarType enum
    const validSugarTypes = ["fasting", "postprandial", "random"];
    if (body.sugarType && !validSugarTypes.includes(body.sugarType)) {
        errors.push(`Sugar type must be one of: ${validSugarTypes.join(", ")}.`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate patient registration data
 */
function validatePatientCreate(body) {
    const errors = [];

    if (!body.fullName || body.fullName.trim().length < 2) {
        errors.push("Full name must be at least 2 characters.");
    }

    if (body.age !== undefined && body.age !== "") {
        const age = parseInt(body.age, 10);
        if (isNaN(age) || age < 0 || age > 130) {
            errors.push("Age must be a number between 0 and 130.");
        }
    }

    if (body.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(body.phone)) {
        errors.push("Phone number format is invalid.");
    }

    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.push("Email address format is invalid.");
    }

    return { valid: errors.length === 0, errors };
}

module.exports = { validateHealthReading, validatePatientCreate, validateVital, VITAL_RANGES };
