import api from "./api";

export const workspaceTeamService = {
    getMembers: async () => {
        const response = await api.get("/workspace-members");
        return response.data.data;
    },

    updateRole: async (memberId, role) => {
        const response = await api.patch(
            `/workspace-members/${memberId}/role`,
            { role }
        );
        return response.data.data;
    },

    removeMember: async (memberId) => {
        const response = await api.delete(
            `/workspace-members/${memberId}`
        );
        return response.data;
    },

    getInvitations: async () => {
        const response = await api.get("/workspace-invitations");
        return response.data.data;
    },

    invite: async (email, role) => {
        const response = await api.post(
            "/workspace-invitations",
            { email, role }
        );
        return response.data;
    },

    revokeInvitation: async (id) => {
        const response = await api.delete(
            `/workspace-invitations/${id}`
        );
        return response.data;
    },

    acceptInvitation: async (token) => {
        const response = await api.post(
            "/workspace-invitations/accept",
            { token }
        );
        return response.data;
    }
};