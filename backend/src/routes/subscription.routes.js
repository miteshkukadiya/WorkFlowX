import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

import {
    getPlans,
    getMySubscription
} from "../controllers/subscription.controller.js";

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

export default router;