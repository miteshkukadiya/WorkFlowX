import api from "./api";


export const reportService = {

    getDashboard:
        async () => {

            const response =
                await api.get(
                    "/reports/dashboard"
                );


            return response.data.data;

        }

};