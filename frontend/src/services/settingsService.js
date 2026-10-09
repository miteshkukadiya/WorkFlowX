import api from "./api";

export const settingsService = {
    getProfile: async () => {
        const response = await api.get("/settings/profile");
        return response.data.data;
    },

    updateProfile: async (data) => {
        const response = await api.patch(
            "/settings/profile",
            data
        );
        return response.data.data;
    },

    uploadAvatar: async (file) => {

        if (!(file instanceof File)) {
            throw new Error("Invalid image file");
        }

        const formData = new FormData();
        formData.append("avatar", file, file.name);

        console.log("Uploading avatar:", {
            name: file.name,
            type: file.type,
            size: file.size,
            formDataFile: formData.get("avatar")
        });

        const response = await api.post(
            "/settings/avatar",
            formData,
            {
                headers: {
                    "Content-Type": undefined
                }
            }
        );

        return response.data.data;
    },

    changePassword: async (data) => {
        const response = await api.patch(
            "/settings/password",
            data
        );
        return response.data;
    },

    updatePreferences: async (data) => {
        const response = await api.patch(
            "/settings/preferences",
            data
        );
        return response.data.data;
    }
};