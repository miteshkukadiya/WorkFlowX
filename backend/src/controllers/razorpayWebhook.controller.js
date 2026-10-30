import crypto from "crypto";

import BillingWebhookEvent from "../models/BillingWebhookEvent.js";
import { syncRazorpaySubscription } from "../../services/razorpaySync.service.js";

const supportedEvents = new Set([
    "subscription.activated",
    "subscription.charged",
    "subscription.pending",
    "subscription.halted",
    "subscription.cancelled",
    "subscription.completed",
    "subscription.resumed"
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

        if (supportedEvents.has(event.event)) {
            const subscriptionId =
                event.payload?.subscription?.entity?.id;

            if (!subscriptionId) {
                return res.sendStatus(400);
            }

            await syncRazorpaySubscription(subscriptionId);
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