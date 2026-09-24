const mongoose = require("mongoose");

const FollowUpSchema = new mongoose.Schema(
    {
        followupId: {
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
        practitionerId: {
            type: String,
            default: "DOC-DEMO"
        },
        doctorName: {
            type: String,
            default: "Dr. Sharma"
        },
        scheduledDate: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            default: "Routine clinical assessment"
        },
        notes: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("FollowUp", FollowUpSchema);
