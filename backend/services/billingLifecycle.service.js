import Subscription from "../src/models/Subscription.js";
import Plan from "../src/models/Plan.js";

const GRACE_PERIOD_DAYS = 3;

export const handleFailedPayment = async (subscriptionId) => {
    const subscription = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId
    });

    if (!subscription) return;

    // Don't revoke an already paid-through period.
    if (
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd > new Date()
    ) {
        subscription.gracePeriodEndsAt = new Date(
            subscription.currentPeriodEnd.getTime() +
            GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
        );
    } else {
        subscription.gracePeriodEndsAt = new Date(
            Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
        );
    }

    subscription.status = "past_due";
    await subscription.save();
};

export const expireSubscriptionToFree = async (subscriptionId) => {
    const subscription = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId
    });

    if (!subscription) return;

    const freePlan = await Plan.findOne({
        code: "free",
        isActive: true
    });

    if (!freePlan) {
        throw new Error("Free plan not configured");
    }

    subscription.plan = freePlan._id;
    subscription.status = "active";
    subscription.provider = "internal";
    subscription.razorpaySubscriptionId = null;
    subscription.currentPeriodStart = null;
    subscription.currentPeriodEnd = null;
    subscription.cancelAtPeriodEnd = false;
    subscription.cancelRequestedAt = null;
    subscription.gracePeriodEndsAt = null;
    subscription.nextBillingAt = null;

    await subscription.save();
};