import mongoose from "mongoose";

import BillingPayment from "../models/BillingPayment.js";
import PlatformAdminAuditLog from "../models/PlatformAdminAuditLog.js";
import Organization from "../models/Organization.js";

const paymentStatuses = [
    "created",
    "authorized",
    "captured",
    "failed",
    "refunded"
];

const auditActions = [
    "organization.suspended",
    "organization.activated",
    "user.suspended",
    "user.activated",
    "subscription.plan_changed"
];

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


// 1. REVENUE TRENDS
export const getPlatformRevenueTrends = async (req, res) => {
    const { period = "daily" } = req.query;

    if (!["daily", "monthly"].includes(period)) {
        return res.status(400).json({
            success: false,
            message: "Period must be daily or monthly"
        });
    }

    let startDate;
    let endDate;
    let dateFormat;

    if (period === "daily") {
        const month = req.query.month;

        if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: "Provide month in YYYY-MM format"
            });
        }

        const [year, monthNumber] = month.split("-").map(Number);

        startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
        endDate = new Date(Date.UTC(year, monthNumber, 1));
        dateFormat = "%Y-%m-%d";

    } else {
        const year = Number(req.query.year);

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid year between 2000 and 2100"
            });
        }

        startDate = new Date(Date.UTC(year, 0, 1));
        endDate = new Date(Date.UTC(year + 1, 0, 1));
        dateFormat = "%Y-%m";
    }

    const trends = await BillingPayment.aggregate([
        {
            $match: {
                status: "captured",
                paidAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: dateFormat,
                            date: "$paidAt",
                            timezone: "UTC"
                        }
                    },
                    currency: "$currency"
                },
                amountPaise: {
                    $sum: "$amount"
                },
                paymentCount: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                "_id.date": 1
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id.date",
                currency: "$_id.currency",
                revenue: {
                    $divide: ["$amountPaise", 100]
                },
                paymentCount: 1
            }
        }
    ]);

    return res.status(200).json({
        success: true,
        message: "Revenue trends fetched successfully",
        data: {
            period,
            range: {
                startDate,
                endDate
            },
            trends
        }
    });
};


// 2. GET ALL PLATFORM PAYMENTS
export const getAllPlatformPayments = async (req, res) => {
    const page = Math.max(
        1,
        parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    // Payment status filter
    if (req.query.status) {
        if (!paymentStatuses.includes(req.query.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        filter.status = req.query.status;
    }

    // Search using Razorpay payment ID
    if (req.query.search?.trim()) {
        const search = escapeRegex(req.query.search.trim());

        filter.razorpayPaymentId = {
            $regex: search,
            $options: "i"
        };
    }

    // Organization search
    if (req.query.organization?.trim()) {
        const search = escapeRegex(
            req.query.organization.trim()
        );

        // const Organization = mongoose.model("Organization");

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

    // Date filters
    if (req.query.from || req.query.to) {
        const dateFilter = {};

        if (req.query.from) {
            const from = new Date(req.query.from);

            if (Number.isNaN(from.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid from date"
                });
            }

            dateFilter.$gte = from;
        }

        if (req.query.to) {
            const to = new Date(req.query.to);

            if (Number.isNaN(to.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid to date"
                });
            }

            // Include the entire specified day for YYYY-MM-DD input.
            if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.to)) {
                to.setUTCHours(23, 59, 59, 999);
            }

            dateFilter.$lte = to;
        }

        if (
            dateFilter.$gte &&
            dateFilter.$lte &&
            dateFilter.$gte > dateFilter.$lte
        ) {
            return res.status(400).json({
                success: false,
                message: "From date cannot be after to date"
            });
        }

        filter.createdAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [payments, totalPayments] = await Promise.all([
        BillingPayment.find(filter)
            .populate("organization", "name slug")
            .populate("subscription", "status provider")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        BillingPayment.countDocuments(filter)
    ]);

    return res.status(200).json({
        success: true,
        message: "Platform payments fetched successfully",
        results: payments.length,
        data: {
            payments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPayments / limit),
                totalPayments,
                limit
            }
        }
    });
};


// 3. GET PAYMENT DETAILS
export const getPlatformPaymentDetails = async (req, res) => {
    const { id } = req.params;

    const isObjectId = mongoose.isValidObjectId(id);

    const payment = await BillingPayment.findOne(
        isObjectId
            ? { _id: id }
            : { razorpayPaymentId: id }
    )
        .populate("organization", "name slug status")
        .populate("subscription", "status provider razorpaySubscriptionId")
        .lean();

    if (!payment) {
        return res.status(404).json({
            success: false,
            message: "Payment not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Payment details fetched successfully",
        data: {
            payment
        }
    });
};


// 4. GET PLATFORM AUDIT LOGS
export const getPlatformAuditLogs = async (req, res) => {
    const page = Math.max(
        1,
        parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    if (req.query.action) {
        if (!auditActions.includes(req.query.action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid audit action"
            });
        }

        filter.action = req.query.action;
    }

    if (req.query.actor && mongoose.isValidObjectId(req.query.actor)) {
        filter.actor = req.query.actor;
    } else if (req.query.actor) {
        return res.status(400).json({
            success: false,
            message: "Invalid actor ID"
        });
    }

    if (req.query.targetOrganization) {
        if (!mongoose.isValidObjectId(req.query.targetOrganization)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID"
            });
        }

        filter.targetOrganization = req.query.targetOrganization;
    }

    if (req.query.targetUser) {
        if (!mongoose.isValidObjectId(req.query.targetUser)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        filter.targetUser = req.query.targetUser;
    }

    if (req.query.from || req.query.to) {
        const dateFilter = {};

        if (req.query.from) {
            const from = new Date(req.query.from);

            if (Number.isNaN(from.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid from date"
                });
            }

            dateFilter.$gte = from;
        }

        if (req.query.to) {
            const to = new Date(req.query.to);

            if (Number.isNaN(to.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid to date"
                });
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.to)) {
                to.setUTCHours(23, 59, 59, 999);
            }

            dateFilter.$lte = to;
        }

        if (
            dateFilter.$gte &&
            dateFilter.$lte &&
            dateFilter.$gte > dateFilter.$lte
        ) {
            return res.status(400).json({
                success: false,
                message: "From date cannot be after to date"
            });
        }

        filter.createdAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [logs, totalLogs] = await Promise.all([
        PlatformAdminAuditLog.find(filter)
            .populate("actor", "name email")
            .populate("targetUser", "name email")
            .populate("targetOrganization", "name slug")
            .populate("targetSubscription", "status provider")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        PlatformAdminAuditLog.countDocuments(filter)
    ]);

    return res.status(200).json({
        success: true,
        message: "Platform audit logs fetched successfully",
        results: logs.length,
        data: {
            logs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
                totalLogs,
                limit
            }
        }
    });
};


// 5. GET SINGLE AUDIT LOG
export const getPlatformAuditLogDetails = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid audit log ID"
        });
    }

    const log = await PlatformAdminAuditLog.findById(id)
        .populate("actor", "name email")
        .populate("targetUser", "name email")
        .populate("targetOrganization", "name slug")
        .populate("targetSubscription", "status provider")
        .lean();

    if (!log) {
        return res.status(404).json({
            success: false,
            message: "Audit log not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            log
        }
    });
};