import api from "./api";

export const taskService = {

    getAll: async (params = {}) => {

        const response = await api.get(
            "/tasks",
            { params }
        );

        return response.data.data;
    },

    getById: async (id) => {

        const response = await api.get(
            `/tasks/${id}`
        );

        return response.data.data;
    },

    create: async (data) => {

        const response = await api.post(
            "/tasks",
            data
        );

        return response.data.data;
    },

    update: async (id, data) => {

        const response = await api.patch(
            `/tasks/${id}`,
            data
        );

        return response.data.data;
    },

    reorder: async (
        projectId,
        tasks
    ) => {

        const response = await api.patch(
            "/tasks/reorder",
            {
                projectId,
                tasks
            }
        );

        return response.data;
    },

    move: async (
        id,
        status,
        position
    ) => {

        const response = await api.patch(
            `/tasks/${id}/move`,
            {
                status,
                position
            }
        );

        return response.data.data;
    },

    delete: async (id) => {

        const response = await api.delete(
            `/tasks/${id}`
        );

        return response.data;
    }



};