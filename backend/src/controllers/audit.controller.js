const AuditLog = require("../models/AuditLog");

/**
 * Get audit logs (with pagination and entity filter)
 */
exports.getAuditLogs = async (req, res, next) => {
    try {
        const { entityType, entityId, limit } = req.query;
        let query = {};
        if (entityType) query.entityType = entityType;
        if (entityId) query.entityId = entityId;

        const maxLimit = parseInt(limit, 10) || 50;
        const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(maxLimit);

        res.json({
            success: true,
            count: logs.length,
            data: logs.map(l => ({
                id: l._id,
                action: l.action,
                role: l.role,
                entityType: l.entityType,
                entityId: l.entityId,
                description: l.description,
                date: l.date,
                time: l.time,
                timestamp: l.timestamp
            }))
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create Audit Log Entry
 */
exports.createAuditLog = async (req, res, next) => {
    try {
        const { action, role, entityType, entityId, description } = req.body;

        if (!action || !entityType) {
            return res.status(400).json({ success: false, message: "action and entityType are required." });
        }

        const log = await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.name) : "System",
            role: role || (req.user ? req.user.role : "practitioner"),
            action,
            entityType,
            entityId: entityId || "",
            description: description || ""
        });

        res.status(201).json({
            success: true,
            data: log
        });
    } catch (err) {
        next(err);
    }
};
