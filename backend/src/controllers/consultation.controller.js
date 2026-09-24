const Consultation = require("../models/Consultation");
const Patient = require("../models/Patient");
const Case = require("../models/Case");
const CaseTimeline = require("../models/CaseTimeline");
const AuditLog = require("../models/AuditLog");

/**
 * Get consultations (optional filter by patientId)
 */
exports.getConsultations = async (req, res, next) => {
    try {
        const { patientId } = req.query;
        const filter = patientId ? { patientId } : {};

        const consultations = await Consultation.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: consultations.length,
            data: consultations.map(c => ({
                id: c.consultationId,
                consultationId: c.consultationId,
                caseId: c.caseId,
                patientId: c.patientId,
                patientName: c.patientName,
                doctorName: c.doctorName,
                durationSeconds: c.durationSeconds,
                date: c.date,
                time: c.time,
                transcript: c.transcript,
                speakerTurns: c.speakerTurns,
                aiGeneratedNotes: c.aiGeneratedNotes,
                structuredNotes: c.structuredNotes,
                isFinalized: c.isFinalized
            }))
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get consultation by ID
 */
exports.getConsultationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const consultation = await Consultation.findOne({
            $or: [{ consultationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!consultation) {
            return res.status(404).json({ success: false, message: "Consultation not found." });
        }

        res.json({
            success: true,
            data: consultation
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Save new or update consultation
 */
exports.saveConsultation = async (req, res, next) => {
    try {
        const consultationId = req.body.consultationId || req.body.id || `CONS-${Date.now().toString().slice(-6)}`;
        const patientId = req.body.patientId || "AYU-2026-DEMO";

        let patientName = req.body.patientName;
        if (!patientName) {
            const patient = await Patient.findOne({ patientId });
            patientName = patient ? patient.fullName : "Patient";
        }

        const doctorName = req.body.doctorName || (req.user ? req.user.name : "Dr. Sharma");

        const consultation = await Consultation.findOneAndUpdate(
            { consultationId },
            {
                $set: {
                    consultationId,
                    patientId,
                    patientName,
                    doctorName,
                    caseId: req.body.caseId || "",
                    durationSeconds: req.body.durationSeconds || 0,
                    transcript: req.body.transcript || "",
                    speakerTurns: req.body.speakerTurns || [],
                    aiGeneratedNotes: req.body.aiGeneratedNotes || null,
                    structuredNotes: req.body.structuredNotes || {},
                    date: req.body.date || new Date().toISOString().split("T")[0],
                    time: req.body.time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                    isFinalized: req.body.isFinalized || false
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Add timeline event
        const mainComplaint = (req.body.structuredNotes && req.body.structuredNotes.complaintMain)
            ? req.body.structuredNotes.complaintMain
            : "Consultation Completed";

        await CaseTimeline.create({
            patientId,
            caseId: req.body.caseId || "",
            category: "Consultation",
            title: `AI Scribe Consultation Saved (${doctorName})`,
            details: `Chief Complaint: ${mainComplaint}. Dialogue Turns: ${(req.body.speakerTurns || []).length}.`,
            icon: "fa-microphone-lines",
            tag: "AI Scribe"
        });

        await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.name) : "Doctor",
            role: "practitioner",
            action: "Save Consultation",
            entityType: "Consultation",
            entityId: consultationId,
            description: `Saved consultation ${consultationId} for ${patientName}`
        });

        res.status(201).json({
            success: true,
            message: "Consultation saved successfully.",
            data: consultation
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete consultation
 */
exports.deleteConsultation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const consultation = await Consultation.findOneAndDelete({
            $or: [{ consultationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!consultation) {
            return res.status(404).json({ success: false, message: "Consultation not found." });
        }

        res.json({
            success: true,
            message: "Consultation deleted."
        });
    } catch (err) {
        next(err);
    }
};
