import api from "./api";


export const notificationService = {

    getAll: async () => {

        const response =
            await api.get(
                "/notifications"
            );

        return response.data.data;

    },


    getUnreadCount:
        async () => {

            const response =
                await api.get(
                    "/notifications/unread-count"
                );

            return response.data.data.count;

        },


    markAsRead:
        async (id) => {

            const response =
                await api.patch(
                    `/notifications/${id}/read`
                );

            return response.data.data;

        },


    markAllAsRead:
        async () => {

            const response =
                await api.patch(
                    "/notifications/read-all"
                );

            return response.data;

        },


    delete:
        async (id) => {

            const response =
                await api.delete(
                    `/notifications/${id}`
                );

            return response.data;

        }

};