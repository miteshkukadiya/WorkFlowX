import { getTenantProject } from "../utils/tenantAccess.js";

export const requireProjectAccess = (
    projectIdResolver = req => req.params.projectId
) => {
    return async (req, res, next) => {
        try {
            const projectId = projectIdResolver(req);

            const project = await getTenantProject({
                projectId,
                organizationId: req.tenant.organizationId
            });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found in this workspace"
                });
            }

            const userId = String(req.user._id);

            const isOwner = String(project.owner) === userId;

            const isMember = project.members?.some(
                member => String(member) === userId
            );

            if (!isOwner && !isMember) {
                return res.status(403).json({
                    success: false,
                    message: "Project access denied"
                });
            }

            req.project = project;

            next();

        } catch (error) {
            next(error);
        }
    };
};