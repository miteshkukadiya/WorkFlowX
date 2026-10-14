let activeOrganizationId = null;

export const setActiveOrganizationId = (id) => {
    activeOrganizationId = id || null;
};

export const getActiveOrganizationId = () => {
    return activeOrganizationId;
};