const ROLE_PERMISSIONS = {
    owner: [
        "member:invite",
        "member:update-role",
        "member:remove",
        "workspace:transfer",
        "billing:manage",
        "audit:view"
    ],

    admin: [
        "member:invite",
        "member:update-role",
        "member:remove",
        "billing:manage",
        "audit:view"
    ],

    manager: [],
    member: [],
    guest: []
};

export const can = (role, permission) => {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};