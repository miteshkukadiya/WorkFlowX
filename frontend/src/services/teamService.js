import api from "./api";


export const teamService = {

    searchUsers: async (
        query
    ) => {

        const response =
            await api.get(
                "/users/search",
                {
                    params: {
                        q: query
                    }
                }
            );

        return response.data.data;
    },


    getMembers: async (
        projectId
    ) => {

        const response =
            await api.get(
                `/projects/${projectId}/members`
            );

        return response.data.data;
    },


    addMember: async (
        projectId,
        userId
    ) => {

        const response =
            await api.post(
                `/projects/${projectId}/members`,
                {
                    userId
                }
            );

        return response.data.data;
    },


    removeMember: async (
        projectId,
        userId
    ) => {

        const response =
            await api.delete(
                `/projects/${projectId}/members/${userId}`
            );

        return response.data.data;
    }

};