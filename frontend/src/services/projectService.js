import api from "./api";

export const projectService = {

    getAll: async () => {
        const response = await api.get("/projects");
        return response.data.data;
    },

    getById: async (id) => {
        const response = await api.get(`/projects/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post("/projects", data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await api.patch(
            `/projects/${id}`,
            data
        );

        return response.data.data;
    },

    delete: async (id) => {
        const response = await api.delete(
            `/projects/${id}`
        );

        return response.data;
    }
};