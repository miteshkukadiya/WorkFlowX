import mongoose from "mongoose";

const billingInvoiceSchema = new mongoose.Schema(
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

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BillingPayment",
            default: null
        },

        razorpayInvoiceId: {
            type: String,
            unique: true,
            sparse: true
        },

        invoiceNumber: {
            type: String,
            default: null
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
            enum: ["issued", "paid", "cancelled", "expired"],
            default: "issued"
        },

        issuedAt: {
            type: Date,
            default: Date.now
        },

        paidAt: {
            type: Date,
            default: null
        },

        invoiceUrl: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

billingInvoiceSchema.index({
    organization: 1,
    issuedAt: -1
});

export default mongoose.model(
    "BillingInvoice",
    billingInvoiceSchema
);