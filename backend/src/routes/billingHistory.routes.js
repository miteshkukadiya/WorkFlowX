import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

import {
    getBillingHistory
} from "../controllers/billingHistory.controller.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get("/history", getBillingHistory);

export default router;