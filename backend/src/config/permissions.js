export const PERMISSIONS = Object.freeze({
    PROJECT_VIEW: "project:view",
    PROJECT_CREATE: "project:create",
    PROJECT_UPDATE: "project:update",
    PROJECT_DELETE: "project:delete",

    TASK_VIEW: "task:view",
    TASK_CREATE: "task:create",
    TASK_UPDATE: "task:update",
    TASK_DELETE: "task:delete",

    MEMBER_VIEW: "member:view",
    MEMBER_INVITE: "member:invite",
    MEMBER_UPDATE_ROLE: "member:update-role",
    MEMBER_REMOVE: "member:remove",

    WORKSPACE_UPDATE: "workspace:update",
    WORKSPACE_TRANSFER: "workspace:transfer",

    BILLING_MANAGE: "billing:manage",
    AUDIT_VIEW: "audit:view"
});

const P = PERMISSIONS;

export const ROLE_PERMISSIONS = Object.freeze({
    owner: Object.values(P),

    admin: [
        P.PROJECT_VIEW,
        P.PROJECT_CREATE,
        P.PROJECT_UPDATE,
        P.PROJECT_DELETE,
        P.TASK_VIEW,
        P.TASK_CREATE,
        P.TASK_UPDATE,
        P.TASK_DELETE,
        P.MEMBER_VIEW,
        P.MEMBER_INVITE,
        P.MEMBER_UPDATE_ROLE,
        P.MEMBER_REMOVE,
        P.WORKSPACE_UPDATE,
        P.BILLING_MANAGE,
        P.AUDIT_VIEW
    ],

    manager: [
        P.PROJECT_VIEW,
        P.PROJECT_CREATE,
        P.PROJECT_UPDATE,
        P.TASK_VIEW,
        P.TASK_CREATE,
        P.TASK_UPDATE,
        P.MEMBER_VIEW
    ],

    member: [
        P.PROJECT_VIEW,
        P.TASK_VIEW,
        P.TASK_CREATE,
        P.TASK_UPDATE,
        P.MEMBER_VIEW
    ],

    guest: [
        P.PROJECT_VIEW,
        P.TASK_VIEW
    ]
});

export const hasPermission = (role, permission) => {
    return (
        ROLE_PERMISSIONS[role]?.includes(permission) === true
    );
};