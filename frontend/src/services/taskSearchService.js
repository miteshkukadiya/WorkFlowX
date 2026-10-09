import api from "./api";

export const taskSearchService = {
    search: async (params = {}) => {
        const response = await api.get(
            "/tasks/search",
            { params }
        );

        return response.data.data;
    }
};