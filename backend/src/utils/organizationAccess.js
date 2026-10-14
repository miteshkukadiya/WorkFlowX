export const requireOrganizationRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.tenant) {
            return res.status(500).json({
                success: false,
                message: "Tenant context is missing"
            });
        }

        if (!allowedRoles.includes(req.tenant.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient workspace permissions"
            });
        }

        next();
    };
};