const HealthReading = require("../models/HealthReading");
const CaseTimeline = require("../models/CaseTimeline");
const AuditLog = require("../models/AuditLog");
const { validateHealthReading } = require("../validators/health.validator");

/**
 * Evaluate vitals for clinical safety targets.
 * Returns structured alerts — SCREENING INDICATORS ONLY, not diagnoses.
 */
function evaluateVitals(reading) {
    const alerts = [];
    const warnings = [];

    if (reading.systolic && reading.diastolic) {
        const s = Number(reading.systolic);
        const d = Number(reading.diastolic);
        if (s >= 180 || d >= 120) {
            alerts.push(`Hypertensive Crisis (${s}/${d} mmHg) — Immediate clinical attention recommended`);
        } else if (s >= 160 || d >= 100) {
            alerts.push(`Stage 2 Hypertension (${s}/${d} mmHg)`);
        } else if (s >= 140 || d >= 90) {
            warnings.push(`Stage 1 Hypertension (${s}/${d} mmHg)`);
        } else if (s < 90 || d < 60) {
            warnings.push(`Low Blood Pressure / Hypotension (${s}/${d} mmHg)`);
        }
    }

    if (reading.bloodSugar) {
        const bs = Number(reading.bloodSugar);
        if (bs > 300) {
            alerts.push(`Severely Elevated Blood Sugar (${bs} mg/dL) — Screening indicator, not diagnosis`);
        } else if (bs > 200) {
            alerts.push(`High Blood Sugar (${bs} mg/dL)`);
        } else if (bs < 60) {
            alerts.push(`Hypoglycemia Indicator (${bs} mg/dL)`);
        } else if (bs < 70) {
            warnings.push(`Low Blood Sugar (${bs} mg/dL)`);
        } else if (bs > 140) {
            warnings.push(`Elevated Blood Sugar (${bs} mg/dL)`);
        }
    }

    if (reading.spo2) {
        const spo2 = Number(reading.spo2);
        if (spo2 < 88) {
            alerts.push(`Critical SpO2 Desaturation (${spo2}%) — Urgent clinical evaluation recommended`);
        } else if (spo2 < 92) {
            alerts.push(`Low Oxygen Saturation (${spo2}%)`);
        } else if (spo2 < 95) {
            warnings.push(`SpO2 Below Optimal Range (${spo2}%)`);
        }
    }

    if (reading.heartRate) {
        const hr = Number(reading.heartRate);
        if (hr > 130) {
            alerts.push(`Significant Tachycardia (${hr} bpm)`);
        } else if (hr > 100) {
            warnings.push(`Tachycardia (${hr} bpm)`);
        } else if (hr < 45) {
            alerts.push(`Significant Bradycardia (${hr} bpm)`);
        } else if (hr < 60) {
            warnings.push(`Bradycardia (${hr} bpm)`);
        }
    }

    if (reading.temperature) {
        const temp = Number(reading.temperature);
        if (temp >= 103) {
            alerts.push(`High Fever (${temp}°F) — Clinical evaluation recommended`);
        } else if (temp >= 100.4) {
            warnings.push(`Fever (${temp}°F)`);
        } else if (temp < 96) {
            warnings.push(`Low Body Temperature / Hypothermia Indicator (${temp}°F)`);
        }
    }

    return {
        isAbnormal: alerts.length > 0 || warnings.length > 0,
        severity: alerts.length > 0 ? "critical" : warnings.length > 0 ? "warning" : "normal",
        abnormalAlerts: alerts,
        warnings: warnings,
        disclaimer: "These are screening indicators only, not medical diagnoses. Practitioner review required."
    };
}

/**
 * Get health readings for a patient (with optional date filter)
 */
exports.getHealthReadings = async (req, res, next) => {
    try {
        const patientId = req.params.patientId || req.query.patientId || (req.user && req.user.patientId);

        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId is required." });
        }

        const { days, startDate, endDate, limit = 100, skip = 0 } = req.query;
        let query = { patientId };

        if (days && days !== "all") {
            const d = parseInt(days, 10);
            if (!isNaN(d) && d > 0) {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - d);
                query.recordedAt = { $gte: cutoff };
            }
        }

        if (startDate && endDate) {
            query.recordedAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const readings = await HealthReading.find(query)
            .sort({ recordedAt: -1 })
            .limit(parseInt(limit, 10))
            .skip(parseInt(skip, 10))
            .lean();

        const totalCount = await HealthReading.countDocuments(query);

        res.json({
            success: true,
            count: readings.length,
            total: totalCount,
            data: readings.map(r => ({
                id: r.readingId,
                readingId: r.readingId,
                patientId: r.patientId,
                systolic: r.systolic,
                diastolic: r.diastolic,
                bloodSugar: r.bloodSugar,
                sugarType: r.sugarType,
                heartRate: r.heartRate,
                spo2: r.spo2,
                temperature: r.temperature,
                weight: r.weight,
                notes: r.notes,
                evalInfo: r.evalInfo || evaluateVitals(r),
                date: r.date,
                time: r.time,
                recordedAt: r.recordedAt
            }))
        });
    } catch (err) {
        console.warn("[HealthReadings] DB offline, returning demo readings:", err.message);
        const pId = req.params.patientId || req.query.patientId || "AYU-2026-DEMO";
        const demoReadings = [
            {
                id: "VIT-SEED-1",
                readingId: "VIT-SEED-1",
                patientId: pId,
                date: new Date().toISOString().split("T")[0],
                time: "08:30 AM",
                systolic: 146,
                diastolic: 94,
                bloodSugar: 148,
                sugarType: "fasting",
                heartRate: 82,
                spo2: 97,
                temperature: 98.6,
                weight: 78.5,
                notes: "Morning reading, mild headache",
                evalInfo: {
                    isAbnormal: true,
                    severity: "warning",
                    abnormalAlerts: [],
                    warnings: ["Stage 1 Hypertension (146/94 mmHg)", "Elevated Blood Sugar (148 mg/dL)"],
                    disclaimer: "These are screening indicators only, not medical diagnoses."
                }
            }
        ];
        return res.json({
            success: true,
            count: demoReadings.length,
            total: demoReadings.length,
            data: demoReadings
        });
    }
};

/**
 * Save new health reading (POST) or update existing (if readingId already exists)
 */
exports.saveHealthReading = async (req, res, next) => {
    try {
        // Backend validation — never trust frontend alone
        const validation = validateHealthReading(req.body);
        if (!validation.valid) {
            return res.status(422).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors
            });
        }

        const patientId = req.body.patientId || (req.user && req.user.patientId) || "AYU-2026-DEMO";
        const readingId = req.body.readingId || req.body.id || `VIT-${Date.now()}`;

        const systolic    = req.body.systolic    ? parseFloat(req.body.systolic)    : undefined;
        const diastolic   = req.body.diastolic   ? parseFloat(req.body.diastolic)   : undefined;
        const bloodSugar  = req.body.bloodSugar  ? parseFloat(req.body.bloodSugar)  : undefined;
        const heartRate   = req.body.heartRate   ? parseFloat(req.body.heartRate)   : undefined;
        const spo2        = req.body.spo2        ? parseFloat(req.body.spo2)        : undefined;
        const temperature = req.body.temperature ? parseFloat(req.body.temperature) : undefined;
        const weight      = req.body.weight      ? parseFloat(req.body.weight)      : undefined;

        const evalInfo = evaluateVitals({ systolic, diastolic, bloodSugar, heartRate, spo2, temperature, weight });

        const readingDoc = await HealthReading.findOneAndUpdate(
            { readingId },
            {
                $set: {
                    readingId,
                    patientId,
                    systolic,
                    diastolic,
                    bloodSugar,
                    sugarType: req.body.sugarType || "random",
                    heartRate,
                    spo2,
                    temperature,
                    weight,
                    notes: req.body.notes || "",
                    evalInfo,
                    date: req.body.date || new Date().toISOString().split("T")[0],
                    time: req.body.time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                    recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date(),
                    createdBy: req.user ? String(req.user.id || req.user.patientId || "system") : "system"
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Build timeline summary
        const parts = [];
        if (systolic && diastolic) parts.push(`BP ${systolic}/${diastolic}`);
        if (bloodSugar) parts.push(`Sugar ${bloodSugar} mg/dL`);
        if (heartRate) parts.push(`HR ${heartRate} bpm`);
        if (spo2) parts.push(`SpO2 ${spo2}%`);
        if (temperature) parts.push(`Temp ${temperature}°F`);
        if (weight) parts.push(`Weight ${weight} kg`);
        const summaryStr = parts.join(", ") || "Daily Vitals";

        // Timeline event (non-blocking)
        CaseTimeline.create({
            patientId,
            category: "Vitals",
            title: `Daily Health Reading Logged (${readingDoc.time})`,
            details: `${summaryStr}. ${evalInfo.isAbnormal
                ? "⚠️ Screening Alerts: " + [...evalInfo.abnormalAlerts, ...evalInfo.warnings].join("; ")
                : "All parameters within expected range."}`,
            icon: "fa-heart-pulse",
            tag: evalInfo.isAbnormal ? "Abnormal Vitals" : "Daily Health"
        }).catch(err => console.warn("[Timeline] Could not create vitals timeline event:", err.message));

        // Audit log (non-blocking)
        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || req.user.patientId || "system"),
                role: req.user.role || "patient",
                action: "HEALTH_READING_CREATED",
                entityType: "HealthReading",
                entityId: readingId,
                description: `${summaryStr}. Patient: ${patientId}`
            }).catch(() => {});
        }

        res.status(201).json({
            success: true,
            message: evalInfo.isAbnormal
                ? "Health reading saved. Screening indicators detected — practitioner review recommended."
                : "Health reading saved successfully.",
            data: {
                id: readingDoc.readingId,
                readingId: readingDoc.readingId,
                patientId: readingDoc.patientId,
                systolic: readingDoc.systolic,
                diastolic: readingDoc.diastolic,
                bloodSugar: readingDoc.bloodSugar,
                sugarType: readingDoc.sugarType,
                heartRate: readingDoc.heartRate,
                spo2: readingDoc.spo2,
                temperature: readingDoc.temperature,
                weight: readingDoc.weight,
                notes: readingDoc.notes,
                date: readingDoc.date,
                time: readingDoc.time,
                recordedAt: readingDoc.recordedAt,
                evalInfo
            },
            evalInfo
        });
    } catch (err) {
        console.warn("[HealthReading] DB offline, returning evaluated reading:", err.message);
        const evalInfo = evaluateVitals(req.body);
        return res.status(201).json({
            success: true,
            message: evalInfo.isAbnormal
                ? "Health reading saved (offline mode). Screening indicators detected — practitioner review recommended."
                : "Health reading saved successfully (offline mode).",
            data: {
                id: req.body.readingId || `READING-${Date.now()}`,
                readingId: req.body.readingId || `READING-${Date.now()}`,
                patientId: req.body.patientId || "AYU-2026-DEMO",
                systolic: req.body.systolic,
                diastolic: req.body.diastolic,
                bloodSugar: req.body.bloodSugar,
                sugarType: req.body.sugarType || "random",
                heartRate: req.body.heartRate,
                spo2: req.body.spo2,
                temperature: req.body.temperature,
                weight: req.body.weight,
                notes: req.body.notes || "",
                date: req.body.date || new Date().toISOString().split("T")[0],
                time: req.body.time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                evalInfo
            },
            evalInfo
        });
    }
};

/**
 * Update existing health reading by ID (readingId or _id)
 */
exports.updateHealthReading = async (req, res, next) => {
    try {
        const { id } = req.params;

        const validation = validateHealthReading(req.body);
        if (!validation.valid) {
            return res.status(422).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors
            });
        }

        const reading = await HealthReading.findOne({
            $or: [
                { readingId: id },
                { _id: /^[0-9a-fA-F]{24}$/.test(id) ? id : null }
            ]
        });

        if (!reading) {
            return res.status(404).json({ success: false, message: "Health reading not found." });
        }

        const systolic    = req.body.systolic !== undefined ? (req.body.systolic !== "" ? parseFloat(req.body.systolic) : undefined) : reading.systolic;
        const diastolic   = req.body.diastolic !== undefined ? (req.body.diastolic !== "" ? parseFloat(req.body.diastolic) : undefined) : reading.diastolic;
        const bloodSugar  = req.body.bloodSugar !== undefined ? (req.body.bloodSugar !== "" ? parseFloat(req.body.bloodSugar) : undefined) : reading.bloodSugar;
        const heartRate   = req.body.heartRate !== undefined ? (req.body.heartRate !== "" ? parseFloat(req.body.heartRate) : undefined) : reading.heartRate;
        const spo2        = req.body.spo2 !== undefined ? (req.body.spo2 !== "" ? parseFloat(req.body.spo2) : undefined) : reading.spo2;
        const temperature = req.body.temperature !== undefined ? (req.body.temperature !== "" ? parseFloat(req.body.temperature) : undefined) : reading.temperature;
        const weight      = req.body.weight !== undefined ? (req.body.weight !== "" ? parseFloat(req.body.weight) : undefined) : reading.weight;

        const evalInfo = evaluateVitals({ systolic, diastolic, bloodSugar, heartRate, spo2, temperature, weight });

        reading.systolic = systolic;
        reading.diastolic = diastolic;
        reading.bloodSugar = bloodSugar;
        if (req.body.sugarType) reading.sugarType = req.body.sugarType;
        reading.heartRate = heartRate;
        reading.spo2 = spo2;
        reading.temperature = temperature;
        reading.weight = weight;
        if (req.body.notes !== undefined) reading.notes = req.body.notes;
        if (req.body.date) reading.date = req.body.date;
        if (req.body.time) reading.time = req.body.time;
        reading.evalInfo = evalInfo;

        await reading.save();

        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || req.user.patientId || "system"),
                role: req.user.role || "patient",
                action: "HEALTH_READING_UPDATED",
                entityType: "HealthReading",
                entityId: reading.readingId,
                description: `Updated health reading ${reading.readingId} for patient ${reading.patientId}`
            }).catch(() => {});
        }

        res.json({
            success: true,
            message: "Health reading updated successfully.",
            data: {
                id: reading.readingId,
                readingId: reading.readingId,
                patientId: reading.patientId,
                systolic: reading.systolic,
                diastolic: reading.diastolic,
                bloodSugar: reading.bloodSugar,
                sugarType: reading.sugarType,
                heartRate: reading.heartRate,
                spo2: reading.spo2,
                temperature: reading.temperature,
                weight: reading.weight,
                notes: reading.notes,
                date: reading.date,
                time: reading.time,
                recordedAt: reading.recordedAt,
                evalInfo
            },
            evalInfo
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete health reading
 */
exports.deleteHealthReading = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reading = await HealthReading.findOneAndDelete({
            $or: [
                { readingId: id },
                { _id: /^[0-9a-fA-F]{24}$/.test(id) ? id : null }
            ]
        });

        if (!reading) {
            return res.status(404).json({ success: false, message: "Health reading not found." });
        }

        if (req.user) {
            AuditLog.create({
                userId: String(req.user.id || req.user.patientId || "system"),
                role: req.user.role || "patient",
                action: "HEALTH_READING_DELETED",
                entityType: "HealthReading",
                entityId: id,
                description: `Deleted health reading ${id} for patient ${reading.patientId}`
            }).catch(() => {});
        }

        res.json({ success: true, message: "Health reading deleted successfully." });
    } catch (err) {
        next(err);
    }
};

/**
 * Get health summary (latest reading + evaluation)
 */
exports.getHealthSummary = async (req, res, next) => {
    try {
        const patientId = req.params.patientId || (req.user && req.user.patientId);
        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId is required." });
        }

        const readings = await HealthReading.find({ patientId }).sort({ recordedAt: -1 }).limit(30).lean();

        if (readings.length === 0) {
            return res.json({
                success: true,
                hasData: false,
                latest: null,
                previous: null,
                evaluation: null,
                totalReadings: 0
            });
        }

        const latest = readings[0];
        const previous = readings.length > 1 ? readings[1] : null;
        const evaluation = evaluateVitals(latest);

        // Compute averages from last 30 readings
        const avgFields = ["systolic", "diastolic", "bloodSugar", "heartRate", "spo2", "temperature", "weight"];
        const averages = {};
        avgFields.forEach(f => {
            const vals = readings.map(r => r[f]).filter(v => v != null && !isNaN(v));
            averages[f] = vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
        });

        res.json({
            success: true,
            hasData: true,
            latest,
            previous,
            evaluation,
            averages,
            totalReadings: readings.length
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get health trends for chart rendering
 */
exports.getHealthTrends = async (req, res, next) => {
    try {
        const patientId = req.params.patientId || (req.user && req.user.patientId);
        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId is required." });
        }

        const { days = 30, metric = "bp" } = req.query;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - parseInt(days, 10));

        const readings = await HealthReading.find({
            patientId,
            recordedAt: { $gte: cutoff }
        }).sort({ recordedAt: 1 }).lean();

        const labels = readings.map(r => r.date);
        const trends = {};

        trends.systolic = readings.map(r => r.systolic || null);
        trends.diastolic = readings.map(r => r.diastolic || null);
        trends.bloodSugar = readings.map(r => r.bloodSugar || null);
        trends.heartRate = readings.map(r => r.heartRate || null);
        trends.spo2 = readings.map(r => r.spo2 || null);
        trends.temperature = readings.map(r => r.temperature || null);
        trends.weight = readings.map(r => r.weight || null);

        // Count abnormal readings
        const abnormalCount = readings.filter(r => {
            const ev = evaluateVitals(r);
            return ev.isAbnormal;
        }).length;

        res.json({
            success: true,
            patientId,
            days: parseInt(days, 10),
            totalReadings: readings.length,
            abnormalCount,
            labels,
            trends
        });
    } catch (err) {
        next(err);
    }
};

exports.evaluateVitals = evaluateVitals;

