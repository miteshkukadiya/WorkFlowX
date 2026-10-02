import express from "express";

import {
    getTaskActivities
} from "../controllers/activity.controller.js";

import {
    protect
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(protect);


router.get(
    "/task/:taskId",
    getTaskActivities
);


export default router;