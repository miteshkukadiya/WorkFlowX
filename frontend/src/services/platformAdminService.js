import api from "./api";

const request = async (method, url, config = {}) => {
    const response = method === "get"
        ? await api.get(url, config)
        : await api[method](url, config.data);
    return response.data.data;
};

export const platformAdminService = {
    getProfile: () => request("get", "/platform-admin/me"),
    getOverview: () => request("get", "/platform-admin/dashboard/overview"),
    getRevenue: () => request("get", "/platform-admin/dashboard/revenue"),
    getDashboardSubscriptionStats: () =>
        request("get", "/platform-admin/dashboard/subscription-stats"),
    getRecentOrganizations: () =>
        request("get", "/platform-admin/dashboard/recent-organizations"),

    getOrganizations: (params) =>
        request("get", "/platform-admin/organizations", { params }),
    getOrganization: (id) =>
        request("get", `/platform-admin/organizations/${id}`),
    setOrganizationStatus: (id, status) =>
        request("patch", `/platform-admin/organizations/${id}/${status}`),

    getUsers: (params) => request("get", "/platform-admin/users", { params }),
    setUserStatus: (id, status) =>
        request("patch", `/platform-admin/users/${id}/${status}`),

    getSubscriptions: (params) =>
        request("get", "/platform-admin/subscriptions", { params }),
    getSubscriptionStats: () =>
        request("get", "/platform-admin/subscriptions/stats"),
    changeSubscriptionPlan: (id, planCode) =>
        request("patch", `/platform-admin/subscriptions/${id}/change-plan`, {
            data: { planCode }
        }),

    getPayments: (params) =>
        request("get", "/platform-admin/payments", { params }),
    getAuditLogs: (params) =>
        request("get", "/platform-admin/audit-logs", { params })
};
