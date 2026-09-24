const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema(
    {
        caseId: {
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
        chiefComplaint: {
            type: String,
            required: true,
            default: "General Malaise"
        },
        symptoms: {
            type: Array,
            default: []
        },
        duration: {
            type: String,
            default: "3 days"
        },
        severity: {
            type: String,
            default: "Moderate (4-6/10)"
        },
        location: {
            type: String,
            default: "Epigastric"
        },
        history: {
            type: Object,
            default: {
                pastConditions: "",
                surgeries: "",
                familyHistory: "",
                lifestyle: ""
            }
        },
        medications: {
            type: Array,
            default: []
        },
        allergies: {
            type: Array,
            default: []
        },
        vitals: {
            type: Object,
            default: {
                bp: "120/80 mmHg",
                heartRate: "72 bpm",
                temperature: "98.6 °F",
                spo2: "98%",
                weight: "65 kg"
            }
        },
        clinicalSummary: {
            type: String,
            default: ""
        },
        aiAnalysis: {
            type: Object,
            default: {
                summary: "",
                primaryDosha: "Pitta",
                confidenceScore: 0.88,
                differentialPossibilities: [],
                explanation: ""
            }
        },
        redFlags: {
            type: Array,
            default: []
        },
        missingInformation: {
            type: Array,
            default: []
        },
        practitionerVerification: {
            type: Object,
            default: {
                isVerified: false,
                verifiedBy: "",
                verifiedAt: null,
                fieldStatuses: {}
            }
        },
        ayushAssessment: {
            type: Object,
            default: {
                prakriti: "Pitta-Vata",
                vikriti: "Pitta Vriddhi",
                agni: "Vishamagni",
                koshta: "Madhyama"
            }
        },
        treatmentPlan: {
            type: Object,
            default: {
                herbalFormulations: [],
                panchakarma: "",
                pathyaApathya: "",
                dietAdvice: ""
            }
        },
        clinicalNotes: {
            type: Array,
            default: []
        },
        consent: {
            type: Object,
            default: {
                caregiverConsent: true,
                caregiverName: "Self / Family"
            }
        },
        followUp: {
            type: Object,
            default: null
        },
        status: {
            type: String,
            enum: ["NEW", "IN PROGRESS", "AI REVIEW", "PRACTITIONER REVIEW", "VERIFIED", "COMPLETED"],
            default: "AI REVIEW"
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

module.exports = mongoose.model("Case", CaseSchema);
