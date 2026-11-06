import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            unique: true
        },

        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            required: true
        },

        
        status: {
            type: String,
            enum: [
                "active",
                "trialing",
                "past_due",
                "cancelled",
                "expired",
                "authenticated",
                "paused"
            ],
            default: "active"
        },


        provider: {
            type: String,
            enum: ["internal", "razorpay"],
            default: "internal"
        },

        razorpaySubscriptionId: {
            type: String,
            default: null
        },

        currentPeriodStart: {
            type: Date,
            default: null
        },

        currentPeriodEnd: {
            type: Date,
            default: null
        },

        trialEndsAt: {
            type: Date,
            default: null
        },

        
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false
        },

        cancelRequestedAt: {
            type: Date,
            default: null
        },

        gracePeriodEndsAt: {
            type: Date,
            default: null
        },

        lastPaymentAt: {
            type: Date,
            default: null
        },

        lastPaymentId: {
            type: String,
            default: null
        },

        nextBillingAt: {
            type: Date,
            default: null
        }

    },
    { timestamps: true }
);

subscriptionSchema.index(
    { razorpaySubscriptionId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpaySubscriptionId: { $type: "string" }
        }
    }
);

export default mongoose.model(
    "Subscription",
    subscriptionSchema
);