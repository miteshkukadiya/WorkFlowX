import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

import { requireOrganizationRole } from "../utils/organizationAccess.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import { PERMISSIONS } from "../config/permissions.js";

import {
    createOrganization,
    getMyOrganizations,
    getCurrentOrganization,
    updateOrganization,
    transferOwnership
} from "../controllers/organization.controller.js";

const router = express.Router();

router.use(protect);

// Does not require an existing workspace
router.post("/", createOrganization);
router.get("/", getMyOrganizations);

// Requires active membership
router.get(
    "/current",
    requireTenant,
    getCurrentOrganization
);

router.patch(
    "/current",
    requireTenant,
    requireOrganizationRole("owner", "admin"),
    updateOrganization
);

router.post(
    "/current/transfer-ownership",
    requireTenant,
    authorizePermission(PERMISSIONS.WORKSPACE_TRANSFER),
    transferOwnership
);

export default router;