import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

import { requireOrganizationRole } from "../utils/organizationAccess.js";

import {
    createOrganization,
    getMyOrganizations,
    getCurrentOrganization,
    updateOrganization
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

export default router;