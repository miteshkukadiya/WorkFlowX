import api from "./api";

export const auditService = {
    getLogs: async (page = 1, limit = 20) => {
        const response = await api.get("/audit-logs", {
            params: { page, limit }
        });

        return response.data.data;
    }
};