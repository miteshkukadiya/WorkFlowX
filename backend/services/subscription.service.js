import Plan from "../src/models/Plan.js";
import Subscription from "../src/models/Subscription.js";

export const getOrCreateFreeSubscription = async (
    organizationId
) => {
    const freePlan = await Plan.findOne({
        code: "free",
        isActive: true
    });

    if (!freePlan) {
        throw new Error(
            "Free plan not configured. Run seedPlans first."
        );
    }

    await Subscription.updateOne(
        { organization: organizationId },
        {
            $setOnInsert: {
                organization: organizationId,
                plan: freePlan._id,
                status: "active",
                provider: "internal"
            }
        },
        { upsert: true }
    );

    return Subscription.findOne({
        organization: organizationId
    }).populate("plan");
};

export const getWorkspaceSubscription = async (
    organizationId
) => {
    return Subscription.findOne({
        organization: organizationId
    }).populate("plan");
};

export const isSubscriptionActive = (subscription) => {
    if (!subscription) return false;

    const now = new Date();

    if (subscription.status === "trialing") {
        return Boolean(
            subscription.trialEndsAt &&
            subscription.trialEndsAt > now
        );
    }

    if (subscription.status === "active") {
        return true;
    }

    if (subscription.status === "past_due") {
        const paidPeriodValid =
            subscription.currentPeriodEnd &&
            subscription.currentPeriodEnd > now;

        const graceValid =
            subscription.gracePeriodEndsAt &&
            subscription.gracePeriodEndsAt > now;

        return Boolean(paidPeriodValid || graceValid);
    }

    return false;
};