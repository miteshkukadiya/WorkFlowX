import mongoose from "mongoose";

const billingPaymentSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true
        },

        razorpayPaymentId: {
            type: String,
            required: true,
            unique: true
        },

        razorpaySubscriptionId: {
            type: String,
            default: null,
            index: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: [
                "created",
                "authorized",
                "captured",
                "failed",
                "refunded"
            ],
            required: true
        },

        method: {
            type: String,
            default: null
        },

        invoiceId: {
            type: String,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        failureReason: {
            type: String,
            default: null
        },

        providerData: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

billingPaymentSchema.index({
    organization: 1,
    createdAt: -1
});

export default mongoose.model(
    "BillingPayment",
    billingPaymentSchema
);