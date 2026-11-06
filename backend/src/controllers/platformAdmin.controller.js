import User from "../models/User.js";
import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";
import Subscription from "../models/Subscription.js";
import BillingPayment from "../models/BillingPayment.js";

// Platform Admin profile
export const getPlatformAdminProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Platform admin authenticated successfully",
        data: {
            admin: {
                id: req.platformAdmin._id,
                userId: req.user._id,
                name: req.user.name,
                email: req.user.email,
                status: req.platformAdmin.status,
                lastLoginAt: req.platformAdmin.lastLoginAt
            }
        }
    });
};

// Day 29: Dashboard overview
export const getDashboardOverview = async (req, res) => {
    const [
        totalOrganizations,
        activeOrganizations,
        suspendedOrganizations,
        totalUsers,
        activeMemberships,
        totalSubscriptions,
        activeSubscriptions,
        trialSubscriptions,
        pastDueSubscriptions
    ] = await Promise.all([
        Organization.countDocuments(),

        Organization.countDocuments({
            status: "active"
        }),

        Organization.countDocuments({
            status: "suspended"
        }),

        User.countDocuments(),

        OrganizationMember.countDocuments({
            status: "active"
        }),

        Subscription.countDocuments(),

        Subscription.countDocuments({
            status: "active"
        }),

        Subscription.countDocuments({
            status: "trialing"
        }),

        Subscription.countDocuments({
            status: "past_due"
        })
    ]);

    res.status(200).json({
        success: true,
        message: "Platform dashboard overview fetched successfully",
        data: {
            organizations: {
                total: totalOrganizations,
                active: activeOrganizations,
                suspended: suspendedOrganizations
            },

            users: {
                total: totalUsers,
                activeMemberships
            },

            subscriptions: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                trialing: trialSubscriptions,
                pastDue: pastDueSubscriptions
            }
        }
    });
};

// Day 29: Revenue analytics
export const getDashboardRevenue = async (req, res) => {
    const now = new Date();

    // Current calendar month in UTC
    const monthStart = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1
    ));

    const nextMonthStart = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1
    ));

    const revenue = await BillingPayment.aggregate([
        {
            $match: {
                status: "captured"
            }
        },
        {
            $group: {
                _id: "$currency",

                lifetimeAmountPaise: {
                    $sum: "$amount"
                },

                lifetimePaymentCount: {
                    $sum: 1
                },

                monthlyAmountPaise: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $gte: [
                                            "$paidAt",
                                            monthStart
                                        ]
                                    },
                                    {
                                        $lt: [
                                            "$paidAt",
                                            nextMonthStart
                                        ]
                                    }
                                ]
                            },
                            "$amount",
                            0
                        ]
                    }
                },

                monthlyPaymentCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $gte: [
                                            "$paidAt",
                                            monthStart
                                        ]
                                    },
                                    {
                                        $lt: [
                                            "$paidAt",
                                            nextMonthStart
                                        ]
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                currency: "$_id",

                lifetimeRevenue: {
                    $divide: [
                        "$lifetimeAmountPaise",
                        100
                    ]
                },

                lifetimePaymentCount: 1,

                monthlyRevenue: {
                    $divide: [
                        "$monthlyAmountPaise",
                        100
                    ]
                },

                monthlyPaymentCount: 1
            }
        }
    ]);

    res.status(200).json({
        success: true,
        message: "Revenue analytics fetched successfully",
        data: {
            month: monthStart.toISOString().slice(0, 7),
            currencyBreakdown: revenue
        }
    });
};

// Day 29: Subscription statistics
export const getSubscriptionStats = async (req, res) => {
    const [statusStats, planStats] = await Promise.all([
        Subscription.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]),

        Subscription.aggregate([
            {
                $lookup: {
                    from: "plans",
                    localField: "plan",
                    foreignField: "_id",
                    as: "planDetails"
                }
            },
            {
                $unwind: {
                    path: "$planDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$planDetails.code",
                    planName: {
                        $first: "$planDetails.name"
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
    ]);

    const statuses = [
        "active",
        "trialing",
        "past_due",
        "cancelled",
        "expired",
        "authenticated",
        "paused"
    ];

    const statusCounts = Object.fromEntries(
        statuses.map(status => [status, 0])
    );

    statusStats.forEach(item => {
        if (item._id in statusCounts) {
            statusCounts[item._id] = item.count;
        }
    });

    res.status(200).json({
        success: true,
        message: "Subscription statistics fetched successfully",
        data: {
            statuses: statusCounts,
            plans: planStats.map(item => ({
                code: item._id || "unknown",
                name: item.planName || "Unknown plan",
                count: item.count
            }))
        }
    });
};

// Day 29: Recent organizations
export const getRecentOrganizations = async (req, res) => {
    const organizations = await Organization.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("owner", "name email")
        .lean();

    const organizationIds = organizations.map(
        organization => organization._id
    );

    const memberCounts = await OrganizationMember.aggregate([
        {
            $match: {
                organization: {
                    $in: organizationIds
                },
                status: "active"
            }
        },
        {
            $group: {
                _id: "$organization",
                count: {
                    $sum: 1
                }
            }
        }
    ]);

    const memberCountMap = new Map(
        memberCounts.map(item => [
            item._id.toString(),
            item.count
        ])
    );

    const result = organizations.map(organization => ({
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        createdAt: organization.createdAt,

        owner: organization.owner
            ? {
                name: organization.owner.name,
                email: organization.owner.email
            }
            : null,

        activeMembers:
            memberCountMap.get(
                organization._id.toString()
            ) || 0
    }));

    res.status(200).json({
        success: true,
        message: "Recent organizations fetched successfully",
        data: {
            organizations: result
        }
    });
};