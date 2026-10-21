import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res, next) => {
    try {
        const page = Math.max(
            1,
            Number.parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
        );

        const filter = {
            organization: req.tenant.organizationId
        };

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate("actor", "name email")
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            AuditLog.countDocuments(filter)
        ]);

        return res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        next(error);
    }
};