/**
 * Centralized Error Handling Middleware
 * Returns consistent { success: false, message, errors? } format
 */
const errorHandler = (err, req, res, next) => {
    // Log error but never log passwords, tokens, or sensitive medical data
    const safeMessage = err.message || "Internal Server Error";
    console.error(`❌ [API Error] ${req.method} ${req.path}: ${safeMessage}`);

    let statusCode = err.statusCode || err.status || 500;
    let message = safeMessage;
    let errors = null;

    // Mongoose CastError (Invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ID format: ${err.value}`;
    }

    // Mongoose Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        const value = (err.keyValue || {})[field];
        message = `An account or record with this ${field} already exists.`;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 422;
        errors = Object.values(err.errors).map((val) => ({
            field: val.path,
            message: val.message
        }));
        message = "Validation failed. Please check the provided data.";
    }

    // Multer Errors
    if (err.name === "MulterError") {
        statusCode = 400;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "Uploaded file exceeds the maximum allowed size (10MB).";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Unexpected file field. Only the designated upload field is accepted.";
        } else {
            message = `File upload error: ${err.message}`;
        }
    }

    // File type error from fileFilter
    if (err.message && err.message.includes("Invalid file type")) {
        statusCode = 400;
        message = err.message;
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token. Please log in again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired. Please log in again.";
    }

    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    // Only show stack trace in development
    if (process.env.NODE_ENV === "development" && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
