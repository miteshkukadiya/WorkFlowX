import { hasPermission } from "../config/permissions.js";

export const authorizePermission = (permission) => {
    return (req, res, next) => {
        if (!req.tenant?.membership) {
            return res.status(401).json({
                success: false,
                message: "Workspace context required"
            });
        }

        const role = req.tenant.membership.role;

        if (!hasPermission(role, permission)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission for this action"
            });
        }

        next();
    };
};