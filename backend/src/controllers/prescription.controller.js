const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const Case = require("../models/Case");
const CaseTimeline = require("../models/CaseTimeline");
const AuditLog = require("../models/AuditLog");

/**
 * Create a new prescription
 */
exports.createPrescription = async (req, res, next) => {
    try {
        const { patientId, caseId, diagnosis, medicines, advice, recommendedTests, followupDate, doctorName } = req.body;

        if (!patientId || !diagnosis || !medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Patient, diagnosis, and at least one prescribed medicine are required."
            });
        }

        const patient = await Patient.findOne({ patientId });
        const patientName = patient ? patient.fullName : "Patient";
        const prescriptionId = req.body.prescriptionId || req.body.id || `RX-${Date.now().toString().slice(-6)}`;
        const prescribingDoctor = doctorName || (req.user ? req.user.name : "Dr. R. K. Sharma (MD Ayush)");

        const prescription = await Prescription.create({
            prescriptionId,
            patientId,
            patientName,
            practitionerId: req.user ? String(req.user.id || "DOC-DEMO") : "DOC-DEMO",
            doctorName: prescribingDoctor,
            caseId: caseId || "",
            diagnosis,
            medicines,
            advice: advice || "",
            recommendedTests: recommendedTests || "",
            followupDate: followupDate || "",
            status: "active"
        });

        // Also sync medication into active case if present
        if (caseId) {
            await Case.findOneAndUpdate(
                { caseId },
                {
                    $set: {
                        medications: medicines.map(m => ({
                            name: m.name,
                            dose: m.dose || "1 Tab",
                            frequency: m.frequency || "1-0-1",
                            instructions: m.instructions || "After Meals",
                            duration: m.duration || "7 Days",
                            reason: m.reason || advice || "Prescribed"
                        }))
                    }
                }
            );
        }

        // Add event to timeline
        const medNames = medicines.map(m => m.name).join(", ");
        await CaseTimeline.create({
            patientId,
            caseId: caseId || "",
            category: "Prescription",
            title: `Prescription Issued by ${prescribingDoctor}`,
            details: `Diagnosis: ${diagnosis}. Meds: ${medNames}. ${advice ? 'Advice: ' + advice : ''}`,
            icon: "fa-prescription",
            tag: "Prescription"
        });

        await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.name) : "Doctor",
            role: "practitioner",
            action: "Issue Prescription",
            entityType: "Prescription",
            entityId: prescriptionId,
            description: `Issued prescription ${prescriptionId} for ${patientName} (${patientId})`
        });

        res.status(201).json({
            success: true,
            message: "Prescription saved and sent to patient portal.",
            data: prescription
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all prescriptions for a patient
 */
exports.getPrescriptionsForPatient = async (req, res, next) => {
    try {
        const patientId = req.params.patientId || (req.user && req.user.patientId);

        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId required." });
        }

        const prescriptions = await Prescription.find({ patientId }).sort({ issuedAt: -1 });

        res.json({
            success: true,
            count: prescriptions.length,
            data: prescriptions.map(rx => ({
                id: rx.prescriptionId,
                prescriptionId: rx.prescriptionId,
                patientId: rx.patientId,
                patientName: rx.patientName,
                doctorName: rx.doctorName,
                caseId: rx.caseId,
                diagnosis: rx.diagnosis,
                medicines: rx.medicines,
                advice: rx.advice,
                recommendedTests: rx.recommendedTests,
                followupDate: rx.followupDate,
                status: rx.status,
                date: rx.date,
                issuedAt: rx.issuedAt
            }))
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get single prescription by ID
 */
exports.getPrescriptionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription.findOne({
            $or: [{ prescriptionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found." });
        }

        res.json({
            success: true,
            data: prescription
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update prescription status
 */
exports.updatePrescription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription.findOneAndUpdate(
            { $or: [{ prescriptionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            { $set: req.body },
            { new: true }
        );

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found." });
        }

        res.json({
            success: true,
            message: "Prescription updated.",
            data: prescription
        });
    } catch (err) {
        next(err);
    }
};
