import cacheService from "../../services/cache.service.js";

const invalidateProjectCache = async (organizationId) => {
    try {
        if (!organizationId) return;

        await cacheService.deleteByPattern(
            `workflowx:projects:${organizationId}:*`
        );
    } catch (error) {
        console.error(
            "Project cache invalidation failed:",
            error.message
        );
    }
};

export default invalidateProjectCache;