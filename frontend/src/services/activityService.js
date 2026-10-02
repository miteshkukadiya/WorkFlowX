import api from "./api";


export const activityService = {

    getByTask: async (
        taskId
    ) => {

        const response =
            await api.get(
                `/activities/task/${taskId}`
            );

        return response.data.data;
    }

};