import Plan from "../src/models/Plan.js";
import Subscription from "../src/models/Subscription.js";
import BillingCheckout from "../src/models/BillingCheckout.js";
import { razorpay } from "../src/config/razorpay.js";

const asDate = value =>
    value ? new Date(Number(value) * 1000) : null;

export const syncRazorpaySubscription = async (
    providerSubscriptionId
) => {
    const provider = await razorpay.subscriptions.fetch(
        providerSubscriptionId
    );

    const checkout = await BillingCheckout.findOne({
        razorpaySubscriptionId: provider.id
    });

    if (!checkout) {
        throw new Error("Unknown Razorpay subscription");
    }

    const plan = await Plan.findById(checkout.plan);

    if (
        !plan ||
        plan.razorpayPlanId !== provider.plan_id
    ) {
        throw new Error("Razorpay plan mismatch");
    }

    const organizationId = checkout.organization;

    // Only confirmed active subscriptions receive paid access.
    const active =
        provider.status === "active" &&
        provider.current_end &&
        Number(provider.current_end) * 1000 > Date.now();

    const statusMap = {
        active: "active",
        pending: "past_due",
        halted: "past_due",
        cancelled: "cancelled",
        completed: "expired",
        expired: "expired"
    };

    const current = await Subscription.findOne({
        organization: organizationId
    });

    if (!current) {
        throw new Error("Workspace subscription missing");
    }

    // Never overwrite another active provider subscription.
    if (
        current.provider === "razorpay" &&
        current.razorpaySubscriptionId !== provider.id
    ) {
        throw new Error("Different paid subscription already linked");
    }

    if (active) {
        current.plan = plan._id;
        current.provider = "razorpay";
        current.razorpaySubscriptionId = provider.id;
        current.status = "active";
        current.currentPeriodStart =
            asDate(provider.current_start);
        current.currentPeriodEnd =
            asDate(provider.current_end);

        await current.save();

        await BillingCheckout.updateOne(
            { _id: checkout._id },
            {
                $set: {
                    status: "activated",
                    activatedAt: new Date()
                }
            }
        );
    } else if (current.razorpaySubscriptionId === provider.id) {
        current.status =
            statusMap[provider.status] || "past_due";

        current.currentPeriodStart =
            asDate(provider.current_start);
        current.currentPeriodEnd =
            asDate(provider.current_end);

        await current.save();

        if (["halted", "cancelled", "completed", "expired"].includes(provider.status)) {
            await BillingCheckout.updateOne(
                {
                    _id: checkout._id,
                    status: { $in: ["created", "authenticated"] }
                },
                {
                    $set: {
                        status: provider.status === "halted"
                            ? "failed"
                            : "cancelled"
                    }
                }
            );
        }
    }

    return {
        providerStatus: provider.status,
        active
    };
};