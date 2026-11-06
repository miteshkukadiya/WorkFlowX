import mongoose from "mongoose";

import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import Organization from "../models/Organization.js";
import BillingPayment from "../models/BillingPayment.js";
import PlatformAdminAuditLog from "../models/PlatformAdminAuditLog.js";

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const subscriptionStatuses = [
    "active",
    "trialing",
    "past_due",
    "cancelled",
    "expired",
    "authenticated",
    "paused"
];


// 1. GET ALL SUBSCRIPTIONS
export const getAllPlatformSubscriptions = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    if (req.query.status) {
        if (!subscriptionStatuses.includes(req.query.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription status"
            });
        }

        filter.status = req.query.status;
    }

    if (req.query.plan) {
        const plan = await Plan.findOne({
            code: req.query.plan
        }).select("_id");

        if (!plan) {
            return res.status(200).json({
                success: true,
                data: {
                    subscriptions: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalSubscriptions: 0,
                        limit
                    }
                }
            });
        }

        filter.plan = plan._id;
    }

    if (req.query.search?.trim()) {
        const search = escapeRegex(req.query.search.trim());

        const organizations = await Organization.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } }
            ]
        }).select("_id");

        filter.organization = {
            $in: organizations.map(org => org._id)
        };
    }

    const skip = (page - 1) * limit;

    const [subscriptions, totalSubscriptions] = await Promise.all([
        Subscription.find(filter)
            .populate("organization", "name slug status")
            .populate("plan", "name code price currency interval limits")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Subscription.countDocuments(filter)
    ]);

    return res.status(200).json({
        success: true,
        results: subscriptions.length,
        data: {
            subscriptions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalSubscriptions / limit),
                totalSubscriptions,
                limit
            }
        }
    });
};


// 2. GET SUBSCRIPTION STATISTICS
export const getPlatformSubscriptionStats = async (req, res) => {
    const [
        total,
        active,
        trialing,
        pastDue,
        cancelled,
        expired,
        authenticated,
        paused,
        planDistribution
    ] = await Promise.all([
        Subscription.countDocuments(),
        Subscription.countDocuments({ status: "active" }),
        Subscription.countDocuments({ status: "trialing" }),
        Subscription.countDocuments({ status: "past_due" }),
        Subscription.countDocuments({ status: "cancelled" }),
        Subscription.countDocuments({ status: "expired" }),
        Subscription.countDocuments({ status: "authenticated" }),
        Subscription.countDocuments({ status: "paused" }),

        Subscription.aggregate([
            {
                $group: {
                    _id: "$plan",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "plans",
                    localField: "_id",
                    foreignField: "_id",
                    as: "plan"
                }
            },
            {
                $unwind: {
                    path: "$plan",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    planName: {
                        $ifNull: ["$plan.name", "Unknown"]
                    },
                    planCode: {
                        $ifNull: ["$plan.code", "unknown"]
                    },
                    count: 1
                }
            }
        ])
    ]);

    return res.status(200).json({
        success: true,
        data: {
            total,
            status: {
                active,
                trialing,
                pastDue,
                cancelled,
                expired,
                authenticated,
                paused
            },
            planDistribution
        }
    });
};


// 3. GET SUBSCRIPTION DETAILS
export const getPlatformSubscriptionDetails = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid subscription ID"
        });
    }

    const subscription = await Subscription.findById(id)
        .populate("organization", "name slug status owner createdAt")
        .populate("plan", "name code price currency interval limits features")
        .lean();

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }

    const payments = await BillingPayment.find({
        subscription: subscription._id
    })
        .select(
            "razorpayPaymentId amount currency status method invoiceId paidAt failureReason createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    return res.status(200).json({
        success: true,
        data: {
            subscription,
            recentPayments: payments
        }
    });
};


// 4. MANUAL PLAN CHANGE
export const changePlatformSubscriptionPlan = async (req, res) => {
    const { id } = req.params;
    const { planCode, reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid subscription ID"
        });
    }

    if (!planCode || !["free", "pro", "business"].includes(planCode)) {
        return res.status(400).json({
            success: false,
            message: "A valid planCode is required"
        });
    }

    if (reason !== undefined &&
        (typeof reason !== "string" || reason.trim().length > 500)) {
        return res.status(400).json({
            success: false,
            message: "Reason must be a string of at most 500 characters"
        });
    }

    const subscription = await Subscription.findById(id)
        .populate("plan", "name code price currency");

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }

    // Do not change a Razorpay-managed subscription locally.
    // Its recurring provider plan and actual charge must remain consistent.
    if (subscription.provider === "razorpay") {
        return res.status(409).json({
            success: false,
            message:
                "This subscription is managed by Razorpay. Change its plan through a supported provider billing flow instead."
        });
    }

    const newPlan = await Plan.findOne({
        code: planCode,
        isActive: true
    });

    if (!newPlan) {
        return res.status(404).json({
            success: false,
            message: "Active plan not found"
        });
    }

    const previousPlan = subscription.plan;

    if (String(previousPlan._id) === String(newPlan._id)) {
        return res.status(409).json({
            success: false,
            message: "Subscription already uses this plan"
        });
    }

    subscription.plan = newPlan._id;

    // Intentionally preserve subscription status, period dates,
    // provider IDs and payment history.
    await subscription.save();

    await PlatformAdminAuditLog.create({
        actor: req.user._id,
        action: "subscription.plan_changed",
        targetOrganization: subscription.organization,
        targetSubscription: subscription._id,
        metadata: {
            previousPlan: previousPlan.code,
            newPlan: newPlan.code,
            reason: reason?.trim() || null,
            billingProvider: subscription.provider
        },
        ipAddress: req.ip
    });

    return res.status(200).json({
        success: true,
        message: "Subscription plan changed successfully",
        data: {
            subscriptionId: subscription._id,
            previousPlan: previousPlan.code,
            newPlan: {
                name: newPlan.name,
                code: newPlan.code,
                price: newPlan.price,
                currency: newPlan.currency
            },
            status: subscription.status,
            provider: subscription.provider
        }
    });
};