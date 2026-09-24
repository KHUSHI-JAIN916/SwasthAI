const mongoose = require("mongoose");

const CaseTimelineSchema = new mongoose.Schema(
    {
        caseId: {
            type: String,
            index: true
        },
        patientId: {
            type: String,
            required: true,
            index: true
        },
        category: {
            type: String,
            default: "Clinical Note"
        },
        title: {
            type: String,
            required: true
        },
        details: {
            type: String,
            default: ""
        },
        icon: {
            type: String,
            default: "fa-notes-medical"
        },
        tag: {
            type: String,
            default: "Doctor Note"
        },
        createdBy: {
            type: String,
            default: "Practitioner"
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0]
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

module.exports = mongoose.model("CaseTimeline", CaseTimelineSchema);
