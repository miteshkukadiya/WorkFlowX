import api from "./api";


export const commentService = {

    getByTask: async (
        taskId
    ) => {

        const response =
            await api.get(
                `/comments/task/${taskId}`
            );

        return response.data.data;
    },


    create: async (
        taskId,
        content,
        parentCommentId = null
    ) => {

        const response =
            await api.post(
                `/comments/task/${taskId}`,
                {
                    content,
                    ...(parentCommentId ? { parentCommentId } : {})
                }
            );

        return response.data.data;
    },

    reply: async (commentId, content) => {
        const response = await api.post(
            `/comments/${commentId}/replies`,
            { content }
        );

        return response.data.data;
    },


    update: async (
        commentId,
        content
    ) => {

        const response =
            await api.patch(
                `/comments/${commentId}`,
                {
                    content
                }
            );

        return response.data.data;
    },


    delete: async (
        commentId
    ) => {

        const response =
            await api.delete(
                `/comments/${commentId}`
            );

        return response.data;
    }

};