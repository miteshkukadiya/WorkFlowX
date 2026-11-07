import cacheService from "../../services/cache.service.js";

const invalidateDashboardCache = async (organizationId) => {
    try {
        if (!organizationId) return;

        const pattern =
            `workflowx:dashboard:${organizationId}:*`;

        await cacheService.deleteByPattern(pattern);

    } catch (error) {
        console.error(
            "Dashboard cache invalidation failed:",
            error.message
        );
    }
};

export default invalidateDashboardCache;