import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { requireOrganizationRole } from "../utils/organizationAccess.js";

import { authorizePermission } from "../middleware/authorizePermission.js";
import { PERMISSIONS } from "../config/permissions.js";

import {
    getMembers,
    updateMemberRole,
    removeMember
} from "../controllers/organizationMember.controller.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get("/", getMembers);

router.patch(
    "/:memberId/role",
    authorizePermission(PERMISSIONS.MEMBER_UPDATE_ROLE),
    updateMemberRole
);

router.delete(
    "/:memberId",
    requireOrganizationRole("owner", "admin"),
    removeMember
);

export default router;