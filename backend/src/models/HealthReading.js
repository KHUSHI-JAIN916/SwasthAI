const mongoose = require("mongoose");

const HealthReadingSchema = new mongoose.Schema(
    {
        readingId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        patientId: {
            type: String,
            required: true,
            index: true
        },
        systolic: {
            type: Number
        },
        diastolic: {
            type: Number
        },
        bloodSugar: {
            type: Number
        },
        sugarType: {
            type: String,
            enum: ["fasting", "postprandial", "random"],
            default: "random"
        },
        heartRate: {
            type: Number
        },
        spo2: {
            type: Number
        },
        temperature: {
            type: Number
        },
        weight: {
            type: Number
        },
        notes: {
            type: String,
            default: ""
        },
        evalInfo: {
            isAbnormal: { type: Boolean, default: false },
            severity: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
            abnormalAlerts: [String],
            warnings: [String],
            disclaimer: { type: String, default: "Screening indicator only — not a medical diagnosis." }
        },
        evaluation: {
            type: Object,
            default: null
        },
        createdBy: {
            type: String,
            default: "patient"
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0]
        },
        time: {
            type: String,
            default: () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        },
        recordedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

HealthReadingSchema.index({ patientId: 1, recordedAt: -1 });

module.exports = mongoose.model("HealthReading", HealthReadingSchema);
