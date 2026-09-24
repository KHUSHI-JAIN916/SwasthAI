const Report = require("../models/Report");
const CaseTimeline = require("../models/CaseTimeline");
const AuditLog = require("../models/AuditLog");
const path = require("path");
const fs = require("fs");

/**
 * Upload diagnostic report
 */
exports.uploadReport = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded. Please upload a PDF or image file."
            });
        }

        const patientId = req.body.patientId || (req.user && req.user.patientId) || "AYU-2026-DEMO";
        const caseId = req.body.caseId || "";
        const reportType = req.body.reportType || "Diagnostic / Blood Investigation";
        const reportId = `REP-${Date.now()}`;

        // Basic mock/simulated AI OCR text extraction from report name
        let extractedText = req.body.extractedText || "";
        if (!extractedText) {
            extractedText = `Diagnostic Investigation Report (${req.file.originalname}). Parameters logged and uploaded to patient medical archive.`;
        }

        const report = await Report.create({
            reportId,
            patientId,
            caseId,
            uploadedBy: req.user ? req.user.role : "patient",
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            reportType,
            extractedText,
            metadata: {
                mimetype: req.file.mimetype,
                sizeBytes: req.file.size
            }
        });

        // Add timeline event
        await CaseTimeline.create({
            patientId,
            caseId,
            category: "Diagnostic Report",
            title: `Lab Report Uploaded: ${req.file.originalname}`,
            details: `Type: ${reportType}. Size: ${(req.file.size / 1024).toFixed(1)} KB. Uploaded to medical dossier.`,
            icon: "fa-file-pdf",
            tag: "Lab Report"
        });

        await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.patientId) : "Patient",
            role: req.user ? req.user.role : "patient",
            action: "Upload Report",
            entityType: "Report",
            entityId: reportId,
            description: `Uploaded report ${req.file.originalname} for ${patientId}`
        });

        res.status(201).json({
            success: true,
            message: "Report uploaded successfully.",
            data: {
                id: report.reportId,
                reportId: report.reportId,
                fileName: report.fileName,
                originalName: report.originalName,
                reportType: report.reportType,
                fileType: report.fileType,
                fileSize: report.fileSize,
                extractedText: report.extractedText,
                date: report.date
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all reports for a patient or case
 */
exports.getReports = async (req, res, next) => {
    try {
        const patientId = req.params.patientId || req.query.patientId || (req.user && req.user.patientId);
        const { caseId } = req.query;

        let query = {};
        if (patientId) query.patientId = patientId;
        if (caseId) query.caseId = caseId;

        const reports = await Report.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports.map(r => ({
                id: r.reportId,
                reportId: r.reportId,
                patientId: r.patientId,
                caseId: r.caseId,
                fileName: r.fileName,
                originalName: r.originalName,
                reportType: r.reportType,
                fileType: r.fileType,
                fileSize: r.fileSize,
                extractedText: r.extractedText,
                date: r.date,
                createdAt: r.createdAt
            }))
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Safe download or view of report file
 */
exports.downloadReportFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await Report.findOne({
            $or: [{ reportId: id }, { fileName: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report file not found." });
        }

        const safePath = path.resolve(report.filePath);
        if (!fs.existsSync(safePath)) {
            return res.status(404).json({ success: false, message: "File missing on server storage." });
        }

        res.setHeader("Content-Disposition", `inline; filename="${report.originalName}"`);
        res.setHeader("Content-Type", report.fileType || "application/octet-stream");
        const fileStream = fs.createReadStream(safePath);
        fileStream.pipe(res);
    } catch (err) {
        next(err);
    }
};

/**
 * Get single report by ID
 */
exports.getReportById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await Report.findOne({
            $or: [{ reportId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found." });
        }

        res.json({
            success: true,
            data: {
                id: report.reportId,
                reportId: report.reportId,
                patientId: report.patientId,
                caseId: report.caseId,
                fileName: report.fileName,
                originalName: report.originalName,
                reportType: report.reportType,
                fileType: report.fileType,
                fileSize: report.fileSize,
                extractedText: report.extractedText,
                date: report.date,
                createdAt: report.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete report by ID (metadata + file)
 */
exports.deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await Report.findOneAndDelete({
            $or: [{ reportId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found." });
        }

        // Delete physical file if exists
        try {
            if (report.filePath && fs.existsSync(report.filePath)) {
                fs.unlinkSync(report.filePath);
            }
        } catch (fileErr) {
            console.warn("[Report] Could not delete physical file:", fileErr.message);
        }

        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || req.user.patientId || "system"),
                role: req.user.role || "patient",
                action: "REPORT_DELETED",
                entityType: "Report",
                entityId: id,
                description: `Deleted report ${report.originalName} for patient ${report.patientId}`
            }).catch(() => {});
        }

        res.json({ success: true, message: "Report deleted successfully." });
    } catch (err) {
        next(err);
    }
};
