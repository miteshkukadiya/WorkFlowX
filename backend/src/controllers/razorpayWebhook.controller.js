import crypto from "crypto";

import BillingWebhookEvent from "../models/BillingWebhookEvent.js";
import BillingCheckout from "../models/BillingCheckout.js";
import Subscription from "../models/Subscription.js";
import { syncRazorpaySubscription } from "../../services/razorpaySync.service.js";

import {
    recordBillingPayment
} from "../../services/billingPayment.service.js";

import {
    handleFailedPayment
} from "../../services/billingLifecycle.service.js";

const supportedEvents = new Set([
    "subscription.activated",
    "subscription.charged",
    "subscription.pending",
    "subscription.halted",
    "subscription.cancelled",
    "subscription.completed",
    "subscription.resumed",
    "payment.authorized",
    "payment.failed"
]);

export const razorpayWebhook = async (req, res, next) => {
    try {
        const signature = req.get("x-razorpay-signature");
        const eventId = req.get("x-razorpay-event-id");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (
            !secret ||
            !Buffer.isBuffer(req.body) ||
            !signature ||
            !/^[a-f0-9]{64}$/i.test(signature)
        ) {
            return res.sendStatus(400);
        }

        const expected = crypto
            .createHmac("sha256", secret)
            .update(req.body)
            .digest();

        const received = Buffer.from(signature, "hex");

        if (!crypto.timingSafeEqual(expected, received)) {
            return res.sendStatus(400);
        }

        if (!eventId) {
            return res.sendStatus(400);
        }

        const existing = await BillingWebhookEvent.exists({
            eventId
        });

        if (existing) {
            return res.status(200).json({ received: true });
        }

        const event = JSON.parse(req.body.toString("utf8"));

        const subscriptionEntity =
            event.payload?.subscription?.entity;

        const paymentEntity =
            event.payload?.payment?.entity;

        const subscriptionId =
            subscriptionEntity?.id ||
            paymentEntity?.subscription_id;

        if (supportedEvents.has(event.event) && subscriptionId) {
            // Link the provider subscription before recording payments that
            // reference the workspace subscription.
            await syncRazorpaySubscription(subscriptionId);

            const checkout = await BillingCheckout.findOne({
                razorpaySubscriptionId: subscriptionId
            });

            const subscription = checkout
                ? await Subscription.findOne({
                    organization: checkout.organization,
                    razorpaySubscriptionId: subscriptionId
                })
                : null;

            if (paymentEntity && checkout && subscription) {
                await recordBillingPayment({
                    organizationId: checkout.organization,
                    subscriptionId,
                    payment: paymentEntity
                });
            }

            if (event.event === "payment.failed" && subscription) {
                await handleFailedPayment(subscriptionId);
            }

            if (
                ["payment.failed", "subscription.halted", "subscription.cancelled", "subscription.completed"]
                    .includes(event.event)
            ) {
                await BillingCheckout.updateOne(
                    {
                        razorpaySubscriptionId: subscriptionId,
                        status: { $in: ["created", "authenticated"] }
                    },
                    {
                        $set: {
                            status: event.event === "subscription.cancelled" ||
                                event.event === "subscription.completed"
                                ? "cancelled"
                                : "failed"
                        }
                    }
                );
            }
        }

        try {
            await BillingWebhookEvent.create({
                eventId,
                eventType: event.event,
                status: supportedEvents.has(event.event)
                    ? "processed"
                    : "ignored"
            });
        } catch (error) {
            // Another request may have recorded this event.
            if (error.code !== 11000) throw error;
        }

        return res.status(200).json({
            received: true
        });

    } catch (error) {
        next(error);
    }
};