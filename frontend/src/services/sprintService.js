import api from "./api";

export const sprintService = {
    getAll: async projectId => {
        const response = await api.get("/sprints", { params: { projectId } });
        return response.data.data;
    },
    create: async data => {
        const response = await api.post("/sprints", data);
        return response.data.data;
    },
    update: async (id, data) => {
        const response = await api.patch(`/sprints/${id}`, data);
        return response.data.data;
    },
    addTask: async (sprintId, taskId) => {
        const response = await api.put(`/sprints/${sprintId}/tasks/${taskId}`);
        return response.data.data;
    },
    removeTask: async (sprintId, taskId) => {
        const response = await api.delete(`/sprints/${sprintId}/tasks/${taskId}`);
        return response.data.data;
    }
};
