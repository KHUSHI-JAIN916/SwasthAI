const Patient = require("../models/Patient");
const AuditLog = require("../models/AuditLog");
const aiService = require("../services/ai.service");

/**
 * Analyze Case — Clinical Decision Support
 * NOT an autonomous medical diagnosis.
 */
exports.analyzeCase = async (req, res, next) => {
    try {
        const { chiefComplaint, symptoms, duration, severity, history, medications, allergies, prakriti, patientId } = req.body;

        const analysis = await aiService.analyzeClinicalCase({
            chiefComplaint, symptoms, history, medications, allergies, prakriti, duration, severity
        });

        // Audit log (non-blocking)
        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || req.user.patientId || "system"),
                role: req.user.role || "practitioner",
                action: "AI_ANALYSIS_REQUESTED",
                entityType: "Case",
                entityId: patientId || chiefComplaint || "case",
                description: `AI case analysis requested for: ${chiefComplaint || "unspecified"}`
            }).catch(() => {});
        }

        res.json({
            success: true,
            data: {
                ...analysis,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Generate Consultation Summary
 */
exports.generateSummary = async (req, res, next) => {
    try {
        const { patientName, patientInfo, chiefComplaint, description, symptoms, duration, notes, vitals } = req.body;

        const summary = await aiService.generateConsultationSummary({
            patientInfo: patientInfo || { fullName: patientName },
            chiefComplaint,
            symptoms,
            notes: notes || description,
            vitals
        });

        res.json({
            success: true,
            data: {
                ...summary,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Suggest Clinical Questions for Adaptive Interview
 */
exports.suggestQuestions = async (req, res, next) => {
    try {
        const { chiefComplaint, language } = req.body;
        const lang = language || "en";

        const questionsByLang = {
            en: [
                "When did this symptom start, and does it worsen after meals or exertion?",
                "Are you experiencing any fever, vomiting, dizziness, or shortness of breath?",
                "Are you currently taking any regular BP, diabetes, or pain medications?",
                "Do you have any known allergies to Penicillin, Sulfa, or other medicines?",
                "Does anyone in your family have a history of heart disease, diabetes, or cancer?"
            ],
            hi: [
                "यह तकलीफ कब से शुरू हुई और क्या भोजन के बाद यह बढ़ जाती है?",
                "क्या इसके साथ बुखार, उल्टी, चक्कर या सांस फूलने की समस्या है?",
                "क्या आप बीपी, शुगर या दर्द की कोई नियमित दवा ले रहे हैं?",
                "क्या आपको पेनिसिलिन, सल्फा या किसी अन्य दवा से एलर्जी है?",
                "परिवार में किसी को दिल की बीमारी, मधुमेह या कैंसर तो नहीं है?"
            ],
            hinglish: [
                "Yeh taklif kab shuru hui thi aur khana khane ke baad badhti hai kya?",
                "Kya iske sath bukhar, ulti, chakkar ya saans phoolne ki pareshani hai?",
                "Kya aap regular koi BP, sugar ya painkiller goli le rahe hain?",
                "Kya kisi dawai jaise Penicillin ya Sulfa se koi allergy hai?",
                "Ghar mein kisi ko heart disease, diabetes ya cancer to nahi hai?"
            ]
        };

        res.json({
            success: true,
            data: {
                suggestedQuestions: questionsByLang[lang] || questionsByLang.en,
                language: lang,
                chiefComplaint: chiefComplaint || null
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * AI Clinical Assistant Chat
 */
exports.assistant = async (req, res, next) => {
    try {
        const { message, patientId, patientContext } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        let targetPatient = patientContext;
        if (!targetPatient && patientId) {
            targetPatient = await Patient.findOne({ patientId }).lean();
        }

        const result = await aiService.assistantChat({
            message,
            patientContext: targetPatient
        });

        // Audit
        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || req.user.patientId || "system"),
                role: req.user.role || "practitioner",
                action: "AI_ANALYSIS_REQUESTED",
                entityType: "Assistant",
                entityId: patientId || "chat",
                description: `AI assistant queried: "${message.slice(0, 80)}"`
            }).catch(() => {});
        }

        res.json({
            success: true,
            data: {
                ...result,
                contextUsed: targetPatient ? targetPatient.fullName : "General Clinical Knowledge Base",
                generatedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * AI Consultation Notes Scribe
 */
exports.generateConsultationNotes = async (req, res, next) => {
    try {
        const { transcriptText, speakerTurns, patientInfo } = req.body;
        const text = transcriptText || (speakerTurns || []).map(t => `${t.speaker}: ${t.text}`).join("\n");

        const summary = await aiService.generateConsultationSummary({
            patientInfo,
            chiefComplaint: req.body.chiefComplaint,
            symptoms: req.body.symptoms,
            notes: text,
            vitals: req.body.vitals
        });

        // Audit
        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || "system"),
                role: req.user.role || "practitioner",
                action: "AI_ANALYSIS_REQUESTED",
                entityType: "Consultation",
                entityId: patientInfo?.patientId || "consultation",
                description: "AI consultation notes generated"
            }).catch(() => {});
        }

        res.json({
            success: true,
            data: {
                ...summary,
                rawTranscript: text ? text.slice(0, 500) : null,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};
