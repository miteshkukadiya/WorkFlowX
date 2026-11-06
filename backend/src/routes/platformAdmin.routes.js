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

import {
    getAllPlatformUsers,
    getPlatformUserDetails,
    suspendPlatformUser,
    activatePlatformUser
} from "../controllers/platformUser.controller.js";


import {
    getAllPlatformSubscriptions,
    getPlatformSubscriptionStats,
    getPlatformSubscriptionDetails,
    changePlatformSubscriptionPlan
} from "../controllers/platformSubscription.controller.js";

import {
    getPlatformRevenueTrends,
    getAllPlatformPayments,
    getPlatformPaymentDetails,
    getPlatformAuditLogs,
    getPlatformAuditLogDetails
} from "../controllers/platformAnalytics.controller.js";

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

// Platform User Management

router.get(
    "/users",
    getAllPlatformUsers
);

router.get(
    "/users/:id",
    getPlatformUserDetails
);

router.patch(
    "/users/:id/suspend",
    suspendPlatformUser
);

router.patch(
    "/users/:id/activate",
    activatePlatformUser
);


//Platform Subscription Management

router.get(
    "/subscriptions",
    getAllPlatformSubscriptions
);

// Keep stats BEFORE /:id
router.get(
    "/subscriptions/stats",
    getPlatformSubscriptionStats
);

router.get(
    "/subscriptions/:id",
    getPlatformSubscriptionDetails
);

router.patch(
    "/subscriptions/:id/change-plan",
    changePlatformSubscriptionPlan
);


// Platform Revenue Analytics

router.get(
    "/analytics/revenue-trends",
    getPlatformRevenueTrends
);


// Platform Payment Management

router.get(
    "/payments",
    getAllPlatformPayments
);

router.get(
    "/payments/:id",
    getPlatformPaymentDetails
);


// Platform Audit Log Management

router.get(
    "/audit-logs",
    getPlatformAuditLogs
);

router.get(
    "/audit-logs/:id",
    getPlatformAuditLogDetails
);

export default router;