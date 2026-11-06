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
    },

    getHistory: async () => {
        const response = await api.get("/billing/history");
        return response.data.data;
    },

    cancel: async (atPeriodEnd = true) => {
        const response = await api.post("/subscriptions/cancel", {
            atPeriodEnd
        });

        return response.data;
    }
};