import api from "./api";

export const authService = {
    forgotPassword: async email => {
        const response = await api.post("/auth/forgot-password", { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post("/auth/reset-password", {
            token,
            password
        });
        return response.data;
    }
};
