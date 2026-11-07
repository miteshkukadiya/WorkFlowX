import express from "express";

import {
    getTaskActivities
} from "../controllers/activity.controller.js";

import {
    protect
} from "../middleware/authMiddleware.js";

import { requireTenant } from "../middleware/tenant.middleware.js";

const router =
    express.Router();


router.use(protect);
router.use(requireTenant);


router.get(
    "/task/:taskId",
    getTaskActivities
);


export default router;