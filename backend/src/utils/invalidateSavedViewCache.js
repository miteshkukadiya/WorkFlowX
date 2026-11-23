import cacheService from "../../services/cache.service.js";

const invalidateSavedViewCache = async (userId) => {
    if (!userId) return;

    await cacheService.delete(`workflowx:saved-views:${userId}`);
};

export default invalidateSavedViewCache;
