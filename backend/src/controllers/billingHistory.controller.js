import BillingPayment from "../models/BillingPayment.js";
import BillingInvoice from "../models/BillingInvoice.js";

export const getBillingHistory = async (req, res, next) => {
    try {
        const organizationId = req.tenant.organizationId;

        const [payments, invoices] = await Promise.all([
            BillingPayment.find({
                organization: organizationId
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .select(
                    "razorpayPaymentId amount currency status method paidAt failureReason createdAt"
                )
                .lean(),

            BillingInvoice.find({
                organization: organizationId
            })
                .sort({ issuedAt: -1 })
                .limit(50)
                .select(
                    "invoiceNumber amount currency status issuedAt paidAt invoiceUrl"
                )
                .lean()
        ]);

        res.json({
            success: true,
            data: {
                payments,
                invoices
            }
        });
    } catch (error) {
        next(error);
    }
};