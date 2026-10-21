import AuditLog from "../src/models/AuditLog.js";

export const writeAuditLog = async ({
    organizationId,
    actorId,
    action,
    targetType,
    targetId = null,
    metadata = {},
    req,
    session
}) => {
    const [log] = await AuditLog.create(
        [{
            organization: organizationId,
            actor: actorId,
            action,
            targetType,
            targetId,
            metadata,
            ipAddress: req?.ip || null,
            userAgent: req?.get("user-agent") || null
        }],
        session ? { session } : {}
    );

    return log;
};