import api from "./api";

export const organizationService = {
    getAll: async () => {
        const response = await api.get("/organizations");
        return response.data.data;
    },

    create: async (name) => {
        const response = await api.post("/organizations", {
            name
        });

        return response.data.data;
    },

    getCurrent: async () => {
        const response = await api.get(
            "/organizations/current"
        );

        return response.data.data;
    },

    updateCurrent: async (data) => {
        const response = await api.patch(
            "/organizations/current",
            data
        );

        return response.data.data;
    }
};