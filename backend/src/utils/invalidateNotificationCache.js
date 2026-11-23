import cacheService from "../../services/cache.service.js";

const invalidateNotificationCache = async (userId) => {
    if (!userId) return;

    await Promise.all([
        cacheService.delete(`workflowx:notifications:${userId}:all`),
        cacheService.delete(`workflowx:notifications:${userId}:unread-count`)
    ]);
};

export default invalidateNotificationCache;
