import redisClient from "../src/config/redis.js";

const cacheService = {
    get: async (key) => {
        try {
            if (!redisClient.isReady) return null;

            const data = await redisClient.get(key);

            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Cache GET Error:", error.message);
            return null;
        }
    },

    set: async (key, value, expiry = 300) => {
        try {
            if (!redisClient.isReady) return false;

            await redisClient.set(key, JSON.stringify(value), {
                EX: expiry
            });

            return true;
        } catch (error) {
            console.error("Cache SET Error:", error.message);
            return false;
        }
    },

    delete: async (key) => {
        try {
            if (!redisClient.isReady) return false;

            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error("Cache DELETE Error:", error.message);
            return false;
        }
    },

    deleteByPattern: async (pattern) => {
        try {
            if (!redisClient.isReady) return false;

            for await (const key of redisClient.scanIterator({
                MATCH: pattern,
                COUNT: 100
            })) {
                await redisClient.del(key);
            }

            return true;
        } catch (error) {
            console.error("Cache PATTERN DELETE Error:", error.message);
            return false;
        }
    }
};

export default cacheService;