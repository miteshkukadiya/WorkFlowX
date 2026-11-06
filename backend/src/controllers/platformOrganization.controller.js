import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";
import Subscription from "../models/Subscription.js";
import PlatformAdminAuditLog from "../models/PlatformAdminAuditLog.js";

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET /organizations
export const getAllPlatformOrganizations = async (req, res) => {
    const page = Math.max(
        1,
        parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const filter = {};

    if (status) {
        if (!["active", "suspended"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization status filter"
            });
        }

        filter.status = status;
    }

    if (search && search.trim()) {
        const searchRegex = new RegExp(
            escapeRegex(search.trim()),
            "i"
        );

        filter.$or = [
            { name: searchRegex },
            { slug: searchRegex }
        ];
    }

    const [organizations, totalOrganizations] = await Promise.all([
        Organization.find(filter)
            .populate("owner", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Organization.countDocuments(filter)
    ]);

    const organizationIds = organizations.map(
        organization => organization._id
    );

    const [memberCounts, subscriptions] = await Promise.all([
        OrganizationMember.aggregate([
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
                    count: { $sum: 1 }
                }
            }
        ]),

        Subscription.find({
            organization: {
                $in: organizationIds
            }
        })
            .populate("plan", "name code price currency")
            .lean()
    ]);

    const memberCountMap = new Map(
        memberCounts.map(item => [
            item._id.toString(),
            item.count
        ])
    );

    const subscriptionMap = new Map(
        subscriptions.map(item => [
            item.organization.toString(),
            item
        ])
    );

    const result = organizations.map(organization => {
        const subscription = subscriptionMap.get(
            organization._id.toString()
        );

        return {
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
                ) || 0,

            subscription: subscription
                ? {
                    status: subscription.status,
                    plan: subscription.plan
                        ? {
                            name: subscription.plan.name,
                            code: subscription.plan.code,
                            price: subscription.plan.price,
                            currency: subscription.plan.currency
                        }
                        : null
                }
                : null
        };
    });

    res.status(200).json({
        success: true,
        message: "Organizations fetched successfully",
        data: {
            organizations: result,
            pagination: {
                currentPage: page,
                limit,
                totalOrganizations,
                totalPages: Math.ceil(
                    totalOrganizations / limit
                )
            }
        }
    });
};

// GET /organizations/:id
export const getPlatformOrganizationDetails = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid organization ID"
        });
    }

    const organization = await Organization.findById(id)
        .populate("owner", "name email createdAt")
        .lean();

    if (!organization) {
        return res.status(404).json({
            success: false,
            message: "Organization not found"
        });
    }

    const [
        members,
        activeMemberCount,
        subscription
    ] = await Promise.all([
        OrganizationMember.find({
            organization: organization._id
        })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),

        OrganizationMember.countDocuments({
            organization: organization._id,
            status: "active"
        }),

        Subscription.findOne({
            organization: organization._id
        })
            .populate("plan")
            .lean()
    ]);

    res.status(200).json({
        success: true,
        message: "Organization details fetched successfully",
        data: {
            organization: {
                ...organization,
                activeMemberCount,
                subscription: subscription || null,

                members: members.map(member => ({
                    _id: member._id,
                    role: member.role,
                    status: member.status,
                    joinedAt: member.joinedAt,

                    user: member.user
                        ? {
                            _id: member.user._id,
                            name: member.user.name,
                            email: member.user.email
                        }
                        : null
                }))
            }
        }
    });
};

// PATCH /organizations/:id/suspend
export const suspendPlatformOrganization = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid organization ID"
        });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
        return res.status(404).json({
            success: false,
            message: "Organization not found"
        });
    }

    if (organization.status === "suspended") {
        return res.status(409).json({
            success: false,
            message: "Organization is already suspended"
        });
    }

    organization.status = "suspended";
    await organization.save();

    await PlatformAdminAuditLog.create({
        actor: req.user._id,
        action: "organization.suspended",
        targetOrganization: organization._id,
        metadata: {
            organizationName: organization.name,
            previousStatus: "active",
            newStatus: "suspended"
        },
        ipAddress: req.ip
    });

    res.status(200).json({
        success: true,
        message: "Organization suspended successfully",
        data: {
            organization: {
                id: organization._id,
                name: organization.name,
                status: organization.status
            }
        }
    });
};

// PATCH /organizations/:id/activate
export const activatePlatformOrganization = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid organization ID"
        });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
        return res.status(404).json({
            success: false,
            message: "Organization not found"
        });
    }

    if (organization.status === "active") {
        return res.status(409).json({
            success: false,
            message: "Organization is already active"
        });
    }

    organization.status = "active";
    await organization.save();

    await PlatformAdminAuditLog.create({
        actor: req.user._id,
        action: "organization.activated",
        targetOrganization: organization._id,
        metadata: {
            organizationName: organization.name,
            previousStatus: "suspended",
            newStatus: "active"
        },
        ipAddress: req.ip
    });

    res.status(200).json({
        success: true,
        message: "Organization activated successfully",
        data: {
            organization: {
                id: organization._id,
                name: organization.name,
                status: organization.status
            }
        }
    });
};