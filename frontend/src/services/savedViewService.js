import api from "./api";

export const savedViewService = {
    getAll: async () => {
        const response = await api.get("/saved-views");
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post("/saved-views", data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/saved-views/${id}`);
        return response.data;
    }
};