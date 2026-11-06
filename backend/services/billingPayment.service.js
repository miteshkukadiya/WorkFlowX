import BillingPayment from "../src/models/BillingPayment.js";
import Subscription from "../src/models/Subscription.js";

export const recordBillingPayment = async ({
    organizationId,
    subscriptionId,
    payment
}) => {
    if (!payment?.id) return null;

    const subscription = await Subscription.findOne({
        organization: organizationId,
        razorpaySubscriptionId: subscriptionId
    });

    if (!subscription) {
        throw new Error("Matching workspace subscription not found");
    }

    const status =
        payment.status === "captured"
            ? "captured"
            : payment.status === "authorized"
                ? "authorized"
                : payment.status === "failed"
                    ? "failed"
                    : "created";

    const update = {
        organization: organizationId,
        subscription: subscription._id,
        razorpaySubscriptionId: subscriptionId,
        amount: payment.amount || 0,
        currency: payment.currency || "INR",
        status,
        method: payment.method || null,
        paidAt: status === "captured"
            ? new Date((payment.created_at || Date.now() / 1000) * 1000)
            : null,
        failureReason: payment.error_description || null,
        providerData: {
            order_id: payment.order_id || null,
            invoice_id: payment.invoice_id || null
        }
    };

    const record = await BillingPayment.findOneAndUpdate(
        { razorpayPaymentId: payment.id },
        { $set: update },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (status === "captured") {
        await Subscription.updateOne(
            { _id: subscription._id },
            {
                $set: {
                    lastPaymentAt: record.paidAt,
                    lastPaymentId: payment.id,
                    gracePeriodEndsAt: null
                }
            }
        );
    }

    return record;
};