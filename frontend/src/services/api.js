import axios from "axios";
import {getActiveOrganizationId} from "../utils/workspaceSession";

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("workflowx_token");

        if(token)
        {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const organizationId = getActiveOrganizationId();

        if (organizationId) {
            config.headers["X-Organization-Id"] = organizationId;
        } else {
            delete config.headers["X-Organization-Id"];
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

export default api;