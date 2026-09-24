const Case = require("../models/Case");
const Patient = require("../models/Patient");
const CaseTimeline = require("../models/CaseTimeline");
const AuditLog = require("../models/AuditLog");
const FollowUp = require("../models/FollowUp");

/**
 * Get all cases with search and status filters
 */
exports.getCases = async (req, res, next) => {
    try {
        const { search, status, patientId, prakriti } = req.query;
        let filter = {};

        if (patientId) {
            filter.patientId = patientId;
        }

        if (status && status !== "all") {
            const s = status.toUpperCase();
            if (s === "ACTIVE") {
                filter.status = { $in: ["NEW", "IN PROGRESS", "AI REVIEW", "PRACTITIONER REVIEW"] };
            } else if (s === "COMPLETED") {
                filter.status = { $in: ["VERIFIED", "COMPLETED"] };
            } else {
                filter.status = s;
            }
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { caseId: regex },
                { patientName: regex },
                { chiefComplaint: regex }
            ];
        }

        const cases = await Case.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: cases.length,
            data: cases.map(c => ({
                id: c.caseId,
                caseId: c.caseId,
                patientId: c.patientId,
                patientName: c.patientName,
                doctorName: c.doctorName,
                chiefComplaint: c.chiefComplaint,
                symptoms: c.symptoms,
                duration: c.duration,
                severity: c.severity,
                location: c.location,
                history: c.history,
                medications: c.medications,
                allergies: c.allergies,
                vitals: c.vitals,
                clinicalSummary: c.clinicalSummary,
                aiAnalysis: c.aiAnalysis,
                redFlags: c.redFlags,
                missingInformation: c.missingInformation,
                practitionerVerification: c.practitionerVerification,
                ayushAssessment: c.ayushAssessment,
                treatmentPlan: c.treatmentPlan,
                clinicalNotes: c.clinicalNotes,
                consent: c.consent,
                followUp: c.followUp,
                status: c.status,
                date: c.date,
                createdAt: c.createdAt
            }))
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get case by ID
 */
exports.getCaseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const caseRecord = await Case.findOne({
            $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!caseRecord) {
            return res.status(404).json({ success: false, message: `Case not found with ID: ${id}` });
        }

        res.json({
            success: true,
            data: {
                id: caseRecord.caseId,
                caseId: caseRecord.caseId,
                patientId: caseRecord.patientId,
                patientName: caseRecord.patientName,
                doctorName: caseRecord.doctorName,
                chiefComplaint: caseRecord.chiefComplaint,
                symptoms: caseRecord.symptoms,
                duration: caseRecord.duration,
                severity: caseRecord.severity,
                location: caseRecord.location,
                history: caseRecord.history,
                medications: caseRecord.medications,
                allergies: caseRecord.allergies,
                vitals: caseRecord.vitals,
                clinicalSummary: caseRecord.clinicalSummary,
                aiAnalysis: caseRecord.aiAnalysis,
                redFlags: caseRecord.redFlags,
                missingInformation: caseRecord.missingInformation,
                practitionerVerification: caseRecord.practitionerVerification,
                ayushAssessment: caseRecord.ayushAssessment,
                treatmentPlan: caseRecord.treatmentPlan,
                clinicalNotes: caseRecord.clinicalNotes,
                consent: caseRecord.consent,
                followUp: caseRecord.followUp,
                status: caseRecord.status,
                date: caseRecord.date,
                createdAt: caseRecord.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create or save new case
 */
exports.createCase = async (req, res, next) => {
    try {
        const count = await Case.countDocuments();
        const caseId = req.body.id || req.body.caseId || `CASE-${Date.now().toString().slice(-4)}`;
        const patientId = req.body.patientId || "AYU-2026-DEMO";

        // Lookup patient name if not supplied
        let patientName = req.body.patientName;
        if (!patientName) {
            const patient = await Patient.findOne({ patientId });
            patientName = patient ? patient.fullName : "Patient";
        }

        const newCase = new Case({
            caseId,
            patientId,
            patientName,
            practitionerId: req.user ? String(req.user.id || "DOC-DEMO") : "DOC-DEMO",
            doctorName: req.user && req.user.name ? req.user.name : "Dr. Sharma",
            chiefComplaint: req.body.chiefComplaint || "General Malaise",
            symptoms: req.body.symptoms || [],
            duration: req.body.duration || "3 days",
            severity: req.body.severity || "Moderate (4-6/10)",
            location: req.body.location || "Epigastric",
            history: req.body.history || {},
            medications: req.body.medications || [],
            allergies: req.body.allergies || [],
            vitals: req.body.vitals || {},
            clinicalSummary: req.body.clinicalSummary || "",
            aiAnalysis: req.body.aiAnalysis || {},
            redFlags: req.body.redFlags || [],
            missingInformation: req.body.missingInformation || [],
            ayushAssessment: req.body.ayushAssessment || {},
            treatmentPlan: req.body.treatmentPlan || {},
            status: req.body.status || "AI REVIEW",
            date: req.body.date || new Date().toISOString().split("T")[0]
        });

        await newCase.save();

        // Add timeline event
        await CaseTimeline.create({
            caseId,
            patientId,
            category: "Case Initiation",
            title: `New Case Created: ${newCase.chiefComplaint}`,
            details: `Severity: ${newCase.severity}, Duration: ${newCase.duration}. Initial status: ${newCase.status}`,
            icon: "fa-folder-plus",
            tag: "Clinical Case"
        });

        await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.name) : "Doctor",
            role: "practitioner",
            action: "Create Case",
            entityType: "Case",
            entityId: caseId,
            description: `Created clinical case ${caseId} for ${patientName}`
        });

        res.status(201).json({
            success: true,
            message: "Case recorded successfully.",
            data: {
                id: newCase.caseId,
                caseId: newCase.caseId,
                patientId: newCase.patientId,
                patientName: newCase.patientName,
                status: newCase.status
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update case by ID
 */
exports.updateCase = async (req, res, next) => {
    try {
        const { id } = req.params;
        const caseRecord = await Case.findOneAndUpdate(
            { $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            { $set: req.body },
            { new: true }
        );

        if (!caseRecord) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        res.json({
            success: true,
            message: "Case updated successfully.",
            data: caseRecord
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Practitioner Review Workspace: Get review bundle
 */
exports.getCaseReview = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const caseRecord = await Case.findOne({
            $or: [{ caseId }, { _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }]
        });

        if (!caseRecord) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        const patient = await Patient.findOne({ patientId: caseRecord.patientId });

        res.json({
            success: true,
            data: {
                case: caseRecord,
                patient: patient
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Practitioner Review Workspace: Update field verification
 */
exports.updateVerification = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { fieldStatuses, isVerified, notes } = req.body;

        const caseRecord = await Case.findOne({
            $or: [{ caseId }, { _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }]
        });

        if (!caseRecord) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        caseRecord.practitionerVerification = {
            isVerified: isVerified !== undefined ? isVerified : true,
            verifiedBy: req.user ? req.user.name : "Dr. Sharma",
            verifiedAt: new Date(),
            fieldStatuses: fieldStatuses || caseRecord.practitionerVerification.fieldStatuses
        };

        if (caseRecord.status === "AI REVIEW") {
            caseRecord.status = "PRACTITIONER REVIEW";
        }

        await caseRecord.save();

        res.json({
            success: true,
            message: "Verification statuses saved.",
            data: caseRecord.practitionerVerification
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Practitioner Review Workspace: Add clinical notes
 */
exports.addClinicalNotes = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { noteText, practitionerName } = req.body;

        if (!noteText) {
            return res.status(400).json({ success: false, message: "Note text is required." });
        }

        const caseRecord = await Case.findOne({
            $or: [{ caseId }, { _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }]
        });

        if (!caseRecord) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        const noteEntry = {
            id: `NOTE-${Date.now()}`,
            text: noteText,
            doctorName: practitionerName || (req.user ? req.user.name : "Dr. Sharma"),
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        };

        caseRecord.clinicalNotes.unshift(noteEntry);
        await caseRecord.save();

        // Add to Timeline
        await CaseTimeline.create({
            caseId: caseRecord.caseId,
            patientId: caseRecord.patientId,
            category: "Doctor Note",
            title: `Clinical Note Added by ${noteEntry.doctorName}`,
            details: noteText.slice(0, 150),
            icon: "fa-notes-medical",
            tag: "Clinical Notes"
        });

        res.status(201).json({
            success: true,
            message: "Clinical note added successfully.",
            data: noteEntry
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Finalize case
 */
exports.finalizeCase = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const caseRecord = await Case.findOne({
            $or: [{ caseId }, { _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }]
        });

        if (!caseRecord) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        caseRecord.status = "VERIFIED";
        caseRecord.practitionerVerification.isVerified = true;
        caseRecord.practitionerVerification.verifiedAt = new Date();
        caseRecord.practitionerVerification.verifiedBy = req.user ? req.user.name : "Dr. Sharma";

        await caseRecord.save();

        // Update patient status if follow-up exists
        if (caseRecord.followUp) {
            await Patient.findOneAndUpdate(
                { patientId: caseRecord.patientId },
                { $set: { status: "followup" } }
            );
        }

        // Add Timeline
        await CaseTimeline.create({
            caseId: caseRecord.caseId,
            patientId: caseRecord.patientId,
            category: "Case Verification",
            title: "Case Finalized & Verified by Practitioner",
            details: `Doctor finalized case assessment and treatment protocol. Status updated to VERIFIED.`,
            icon: "fa-certificate",
            tag: "Finalized"
        });

        await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.name) : "Doctor",
            role: "practitioner",
            action: "Finalize Case",
            entityType: "Case",
            entityId: caseRecord.caseId,
            description: `Finalized and verified case ${caseRecord.caseId} for ${caseRecord.patientName}`
        });

        res.json({
            success: true,
            message: "Case finalized and verified successfully.",
            data: caseRecord
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Add Timeline Event
 */
exports.addTimelineEvent = async (req, res, next) => {
    try {
        const { patientId, caseId, category, title, details, icon, tag } = req.body;

        if (!patientId || !title) {
            return res.status(400).json({ success: false, message: "patientId and title are required." });
        }

        const event = await CaseTimeline.create({
            patientId,
            caseId: caseId || "",
            category: category || "Clinical Note",
            title,
            details: details || "",
            icon: icon || "fa-notes-medical",
            tag: tag || "Event",
            createdBy: req.user ? req.user.role : "practitioner"
        });

        res.status(201).json({
            success: true,
            message: "Timeline event recorded.",
            data: event
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Schedule Followup
 */
exports.scheduleFollowup = async (req, res, next) => {
    try {
        const { patientId, caseId, scheduledDate, reason, notes } = req.body;

        if (!patientId || !scheduledDate) {
            return res.status(400).json({ success: false, message: "patientId and scheduledDate are required." });
        }

        const followupId = `FUP-${Date.now()}`;
        const doctorName = req.user ? req.user.name : "Dr. Sharma";

        const followUp = await FollowUp.create({
            followupId,
            patientId,
            caseId: caseId || "",
            doctorName,
            scheduledDate,
            reason: reason || "Follow-up Consultation",
            notes: notes || ""
        });

        // Update Case if caseId present
        if (caseId) {
            await Case.findOneAndUpdate(
                { caseId },
                { $set: { followUp: { scheduledDate, reason, notes } } }
            );
        }

        // Update Patient status
        await Patient.findOneAndUpdate(
            { patientId },
            { $set: { status: "followup" } }
        );

        // Timeline event
        await CaseTimeline.create({
            patientId,
            caseId: caseId || "",
            category: "Follow-up",
            title: `Follow-up Scheduled for ${scheduledDate}`,
            details: `Reason: ${reason || 'Review appointment'}. Scheduled by ${doctorName}`,
            icon: "fa-calendar-check",
            tag: "Follow-up"
        });

        res.status(201).json({
            success: true,
            message: "Follow-up scheduled successfully.",
            data: followUp
        });
    } catch (err) {
        next(err);
    }
};
