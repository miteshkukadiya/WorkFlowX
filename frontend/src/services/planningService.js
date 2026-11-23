import api from "./api";

export const planningService = {
    getTasks: async projectId => {
        const response = await api.get("/tasks", {
            params: projectId ? { projectId } : {}
        });
        return response.data.data || [];
    },

    getDependencies: async taskId => {
        const response = await api.get(`/tasks/${taskId}/dependencies`);
        return response.data.data || [];
    },

    updateDependencies: async (taskId, dependencyIds) => {
        const response = await api.put(`/tasks/${taskId}/dependencies`, {
            dependencyIds
        });
        return response.data.data || [];
    }
};
