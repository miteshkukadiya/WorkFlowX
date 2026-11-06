import crypto from "crypto";
import Plan from "../models/Plan.js";
import BillingCheckout from "../models/BillingCheckout.js";
import Subscription from "../models/Subscription.js";
import { razorpay } from "../config/razorpay.js";

const CHECKOUT_TIMEOUT_MS = 15 * 60 * 1000;

const verifySignature = (message, signature, secret) => {
    if (
        typeof signature !== "string" ||
        !/^[a-f0-9]{64}$/i.test(signature)
    ) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest();

    const received = Buffer.from(signature, "hex");

    return crypto.timingSafeEqual(expected, received);
};

export const createRazorpaySubscription = async (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured"
            });
        }

        const { planCode } = req.body;

        if (!["pro", "business"].includes(planCode)) {
            return res.status(400).json({
                success: false,
                message: "Select Pro or Business"
            });
        }

        const organizationId = req.tenant.organizationId;

        const plan = await Plan.findOne({
            code: planCode,
            isActive: true
        });

        if (!plan?.razorpayPlanId) {
            return res.status(503).json({
                success: false,
                message: "Razorpay plan is not configured"
            });
        }

        const current = await Subscription.findOne({
            organization: organizationId
        }).populate("plan");

        if (current?.plan?.code === planCode &&
            current.status === "active") {
            return res.status(409).json({
                success: false,
                message: "This plan is already active"
            });
        }

        // For Day 26, do not allow changing an existing paid plan.
        // A separate upgrade/downgrade workflow is required.
        if (current?.provider === "razorpay") {
            return res.status(409).json({
                success: false,
                message: "Paid plan changes are not enabled yet"
            });
        }

        let pending = await BillingCheckout.findOne({
            organization: organizationId,
            status: {
                $in: ["created", "authenticated"]
            }
        }).sort({ createdAt: -1 });

        if (
            pending?.status === "created" &&
            Date.now() - pending.createdAt.getTime() > CHECKOUT_TIMEOUT_MS
        ) {
            const providerSubscription =
                await razorpay.subscriptions.fetch(
                    pending.razorpaySubscriptionId
                );

            if (
                !["cancelled", "completed", "expired", "halted"]
                    .includes(providerSubscription.status)
            ) {
                await razorpay.subscriptions.cancel(
                    pending.razorpaySubscriptionId,
                    0
                );
            }

            await BillingCheckout.updateOne(
                { _id: pending._id, status: "created" },
                { $set: { status: "cancelled" } }
            );
            pending = null;
        }

        if (pending) {
            return res.status(409).json({
                success: false,
                message: "A checkout is already pending"
            });
        }

        const providerSubscription =
            await razorpay.subscriptions.create({
                plan_id: plan.razorpayPlanId,
                total_count: 12,
                quantity: 1,
                customer_notify: 1,
                notes: {
                    organizationId: String(organizationId),
                    planCode
                }
            });

        await BillingCheckout.create({
            organization: organizationId,
            plan: plan._id,
            initiatedBy: req.user._id,
            razorpaySubscriptionId: providerSubscription.id
        });

        return res.status(201).json({
            success: true,
            data: {
                keyId: process.env.RAZORPAY_KEY_ID,
                subscriptionId: providerSubscription.id,
                planName: plan.name,
                testMode: process.env.RAZORPAY_KEY_ID
                    ?.startsWith("rzp_test_") || false
            }
        });

    } catch (error) {
        next(error);
    }
};

export const verifyCheckoutAuthorization = async (req, res, next) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_payment_id ||
            !razorpay_subscription_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Incomplete checkout response"
            });
        }

        const checkout = await BillingCheckout.findOne({
            organization: req.tenant.organizationId,
            razorpaySubscriptionId: razorpay_subscription_id
        });

        if (!checkout) {
            return res.status(404).json({
                success: false,
                message: "Checkout not found"
            });
        }

        const valid = verifySignature(
            `${razorpay_payment_id}|${razorpay_subscription_id}`,
            razorpay_signature,
            process.env.RAZORPAY_KEY_SECRET
        );

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Invalid checkout signature"
            });
        }

        await BillingCheckout.updateOne(
            {
                _id: checkout._id,
                status: "created"
            },
            {
                $set: {
                    status: "authenticated"
                }
            }
        );

        // Do not activate entitlements here.
        return res.json({
            success: true,
            message: "Checkout signature verified. Awaiting provider confirmation.",
            data: {
                subscriptionId: razorpay_subscription_id
            }
        });

    } catch (error) {
        next(error);
    }
};

export const cancelRazorpayCheckout = async (req, res, next) => {
    try {
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                message: "Checkout subscription is required"
            });
        }

        const checkout = await BillingCheckout.findOneAndUpdate(
            {
                organization: req.tenant.organizationId,
                razorpaySubscriptionId: subscriptionId,
                status: { $in: ["created", "authenticated"] }
            },
            {
                $set: {
                    status: "cancelled"
                }
            },
            { new: true }
        );

        return res.json({
            success: true,
            cancelled: Boolean(checkout)
        });
    } catch (error) {
        next(error);
    }
};