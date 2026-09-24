const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
    {
        prescriptionId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        patientId: {
            type: String,
            required: true,
            index: true
        },
        patientName: {
            type: String,
            default: "Patient"
        },
        practitionerId: {
            type: String,
            default: "DOC-DEMO"
        },
        doctorName: {
            type: String,
            default: "Dr. R. K. Sharma (MD Ayush - Senior Physician)"
        },
        caseId: {
            type: String,
            index: true
        },
        diagnosis: {
            type: String,
            required: true
        },
        medicines: [
            {
                name: { type: String, required: true },
                form: { type: String, default: "Tablet" },
                dose: { type: String, default: "1 Tab" },
                frequency: { type: String, default: "Morning (08:00 AM)" },
                timing: { type: String, default: "After Meals" },
                instructions: { type: String, default: "After Meals" },
                duration: { type: String, default: "7 Days" },
                reason: { type: String, default: "Prescribed treatment" }
            }
        ],
        advice: {
            type: String,
            default: ""
        },
        recommendedTests: {
            type: String,
            default: ""
        },
        followupDate: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active"
        },
        issuedAt: {
            type: Date,
            default: Date.now
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
