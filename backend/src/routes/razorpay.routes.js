import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import { PERMISSIONS } from "../config/permissions.js";

import {
    createRazorpaySubscription,
    verifyCheckoutAuthorization,
    cancelRazorpayCheckout
} from "../controllers/razorpay.controller.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);
router.use(
    authorizePermission(PERMISSIONS.BILLING_MANAGE)
);

router.post("/checkout", createRazorpaySubscription);
router.post("/verify", verifyCheckoutAuthorization);
router.post("/checkout/cancel", cancelRazorpayCheckout);

export default router;