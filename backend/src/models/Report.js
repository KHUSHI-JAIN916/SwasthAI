const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
    {
        reportId: {
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
        caseId: {
            type: String,
            default: ""
        },
        uploadedBy: {
            type: String,
            default: "patient"
        },
        fileName: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            default: "application/pdf"
        },
        fileSize: {
            type: Number,
            default: 0
        },
        reportType: {
            type: String,
            default: "Diagnostic / Blood Investigation"
        },
        extractedText: {
            type: String,
            default: ""
        },
        metadata: {
            type: Object,
            default: {}
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

module.exports = mongoose.model("Report", ReportSchema);
