import api from "./api";

export const razorpayService = {
    createCheckout: async (planCode) => {
        const response = await api.post(
            "/billing/razorpay/checkout",
            { planCode }
        );

        return response.data.data;
    },

    verifyCheckout: async (data) => {
        const response = await api.post(
            "/billing/razorpay/verify",
            data
        );

        return response.data;
    },

    cancelCheckout: async (subscriptionId) => {
        const response = await api.post(
            "/billing/razorpay/checkout/cancel",
            { subscriptionId }
        );

        return response.data;
    }
};