import Subscription from "../src/models/Subscription.js";
import {
    expireSubscriptionToFree
} from "../services/billingLifecycle.service.js";

export const expirePastDueSubscriptions = async () => {
    const now = new Date();

    const expired = await Subscription.find({
        status: "past_due",
        gracePeriodEndsAt: {
            $lte: now,
            $ne: null
        }
    }).select("razorpaySubscriptionId");

    for (const subscription of expired) {
        if (subscription.razorpaySubscriptionId) {
            await expireSubscriptionToFree(
                subscription.razorpaySubscriptionId
            );
        }
    }

    return expired.length;
};