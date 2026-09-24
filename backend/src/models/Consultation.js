const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema(
    {
        consultationId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        caseId: {
            type: String,
            index: true
        },
        patientId: {
            type: String,
            required: true,
            index: true
        },
        patientName: {
            type: String,
            required: true
        },
        practitionerId: {
            type: String,
            default: "DOC-DEMO"
        },
        doctorName: {
            type: String,
            default: "Dr. Sharma"
        },
        durationSeconds: {
            type: Number,
            default: 0
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0]
        },
        time: {
            type: String,
            default: () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        },
        transcript: {
            type: String,
            default: ""
        },
        speakerTurns: [
            {
                speaker: String,
                text: String,
                timestamp: String
            }
        ],
        aiGeneratedNotes: {
            type: Object,
            default: null
        },
        structuredNotes: {
            type: Object,
            default: {
                complaintMain: "",
                complaintDuration: "",
                complaintSeverity: "",
                symptomsPresent: "",
                symptomsNegative: "",
                historyConditions: "",
                historySurgeries: "",
                historyAllergies: "",
                historyMeds: "",
                vitals: {},
                assessment: "",
                plan: {},
                doctorNotes: ""
            }
        },
        isFinalized: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Consultation", ConsultationSchema);
