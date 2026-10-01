import api from "./api";


export const timeService = {

    start: async (
        taskId,
        description = ""
    ) => {

        const response =
            await api.post(
                "/time/start",
                {
                    taskId,
                    description
                }
            );

        return response.data.data;
    },


    stop: async () => {

        const response =
            await api.patch(
                "/time/stop"
            );

        return response.data.data;
    },


    getActive: async () => {

        const response =
            await api.get(
                "/time/active"
            );

        return response.data.data;
    },


    addManual: async (data) => {

        const response =
            await api.post(
                "/time/manual",
                data
            );

        return response.data.data;
    },


    getEntries: async (
        params = {}
    ) => {

        const response =
            await api.get(
                "/time/entries",
                {
                    params
                }
            );

        return response.data.data;
    },


    getSummary: async () => {

        const response =
            await api.get(
                "/time/summary"
            );

        return response.data.data;
    }

};