const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: "system"
        },
        role: {
            type: String,
            default: "practitioner"
        },
        action: {
            type: String,
            required: true
        },
        entityType: {
            type: String,
            required: true
        },
        entityId: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0]
        },
        time: {
            type: String,
            default: () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
