import express from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/authMiddleware.js";

import { requireTenant } from "../middleware/tenant.middleware.js";


const router = express.Router();


router.use(protect);
router.use(requireTenant);


router.get(
    "/",
    getDashboard
);


export default router;