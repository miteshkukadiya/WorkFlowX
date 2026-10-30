import mongoose from "mongoose";

const billingCheckoutSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            required: true
        },

        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        razorpaySubscriptionId: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: [
                "created",
                "authenticated",
                "activated",
                "failed",
                "cancelled"
            ],
            default: "created"
        },

        activatedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

billingCheckoutSchema.index({
    organization: 1,
    createdAt: -1
});

export default mongoose.model(
    "BillingCheckout",
    billingCheckoutSchema
);