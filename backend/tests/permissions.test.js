import { describe, expect, it } from "vitest";

import {
    PERMISSIONS,
    hasPermission
} from "../src/config/permissions.js";

describe("Workspace RBAC", () => {
    it("allows owner to transfer ownership", () => {
        expect(
            hasPermission(
                "owner",
                PERMISSIONS.WORKSPACE_TRANSFER
            )
        ).toBe(true);
    });

    it("denies admin ownership transfer", () => {
        expect(
            hasPermission(
                "admin",
                PERMISSIONS.WORKSPACE_TRANSFER
            )
        ).toBe(false);
    });

    it("denies member invitations", () => {
        expect(
            hasPermission(
                "member",
                PERMISSIONS.MEMBER_INVITE
            )
        ).toBe(false);
    });

    it("allows admin to view audit logs", () => {
        expect(
            hasPermission(
                "admin",
                PERMISSIONS.AUDIT_VIEW
            )
        ).toBe(true);
    });

    it("denies guest task modifications", () => {
        expect(
            hasPermission(
                "guest",
                PERMISSIONS.TASK_UPDATE
            )
        ).toBe(false);
    });

    it("denies unknown roles", () => {
        expect(
            hasPermission(
                "unknown",
                PERMISSIONS.PROJECT_DELETE
            )
        ).toBe(false);
    });
});