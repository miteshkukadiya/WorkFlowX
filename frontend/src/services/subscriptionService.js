import api from "./api";

export const subscriptionService = {
    getPlans: async () => {
        const response = await api.get(
            "/subscriptions/plans"
        );

        return response.data.data;
    },

    getCurrent: async () => {
        const response = await api.get(
            "/subscriptions/current"
        );

        return response.data.data;
    }
};