import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

import {
    getPlans,
    getMySubscription
} from "../controllers/subscription.controller.js";

import {
    cancelWorkspaceSubscription
} from "../controllers/subscriptionLifecycle.controller.js";

import { authorizePermission } from "../middleware/authorizePermission.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// Public pricing catalog
router.get("/plans", getPlans);

// Workspace-specific billing information
router.get(
    "/current",
    protect,
    requireTenant,
    getMySubscription
);

router.post(
    "/cancel",
    protect,
    requireTenant,
    authorizePermission(PERMISSIONS.BILLING_MANAGE),
    cancelWorkspaceSubscription
);

export default router;