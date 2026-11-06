import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    requirePlatformAdmin
} from "../middleware/platformAdmin.middleware.js";

import {
    getPlatformAdminProfile,
    getDashboardOverview,
    getDashboardRevenue,
    getSubscriptionStats,
    getRecentOrganizations
} from "../controllers/platformAdmin.controller.js";

import {
    getAllPlatformOrganizations,
    getPlatformOrganizationDetails,
    suspendPlatformOrganization,
    activatePlatformOrganization
} from "../controllers/platformOrganization.controller.js";

const { protect } = authMiddleware;

const router = express.Router();

// All routes require authentication and platform admin access.
router.use(protect);
router.use(requirePlatformAdmin);

// Day 28
router.get("/me", getPlatformAdminProfile);

// Day 29
router.get(
    "/dashboard/overview",
    getDashboardOverview
);

router.get(
    "/dashboard/revenue",
    getDashboardRevenue
);

router.get(
    "/dashboard/subscription-stats",
    getSubscriptionStats
);

router.get(
    "/dashboard/recent-organizations",
    getRecentOrganizations
);


// Platform Organization Management

router.get(
    "/organizations",
    getAllPlatformOrganizations
);

router.get(
    "/organizations/:id",
    getPlatformOrganizationDetails
);

router.patch(
    "/organizations/:id/suspend",
    suspendPlatformOrganization
);

router.patch(
    "/organizations/:id/activate",
    activatePlatformOrganization
);

export default router;