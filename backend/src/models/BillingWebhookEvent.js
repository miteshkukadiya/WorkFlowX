import mongoose from "mongoose";

const billingWebhookEventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true
        },

        eventType: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["processed", "ignored"],
            required: true
        },

        processedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export default mongoose.model(
    "BillingWebhookEvent",
    billingWebhookEventSchema
);