import Subscription from "../models/Subscription.js";
import BillingCheckout from "../models/BillingCheckout.js";
import { razorpay } from "../config/razorpay.js";

export const cancelWorkspaceSubscription = async (req, res, next) => {
    try {
        const { atPeriodEnd = true } = req.body;

        if (typeof atPeriodEnd !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "atPeriodEnd must be true or false"
            });
        }

        const subscription = await Subscription.findOne({
            organization: req.tenant.organizationId
        }).populate("plan");

        if (
            !subscription ||
            subscription.provider !== "razorpay" ||
            !subscription.razorpaySubscriptionId
        ) {
            return res.status(400).json({
                success: false,
                message: "No Razorpay subscription found"
            });
        }

        if (
            ["cancelled", "expired"].includes(subscription.status)
        ) {
            return res.status(409).json({
                success: false,
                message: "Subscription is already cancelled or expired"
            });
        }

        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured"
            });
        }

        const providerResult = await razorpay.subscriptions.cancel(
            subscription.razorpaySubscriptionId,
            atPeriodEnd ? 1 : 0
        );

        // Provider response is recorded, but webhook/fetch remains
        // authoritative for final lifecycle synchronization.
        subscription.cancelRequestedAt = new Date();
        subscription.cancelAtPeriodEnd = atPeriodEnd;
        await subscription.save();

        return res.json({
            success: true,
            message: atPeriodEnd
                ? "Cancellation requested for the end of the billing cycle"
                : "Immediate cancellation requested",
            data: {
                providerStatus: providerResult.status,
                cancelAtPeriodEnd: atPeriodEnd,
                currentPeriodEnd: subscription.currentPeriodEnd
            }
        });
    } catch (error) {
        next(error);
    }
};