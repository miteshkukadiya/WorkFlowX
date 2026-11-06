import mongoose from "mongoose";

import User from "../models/User.js";
import PlatformAdmin from "../models/PlatformAdmin.js";
import OrganizationMember from "../models/OrganizationMember.js";
import PlatformAdminAuditLog from "../models/PlatformAdminAuditLog.js";


const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


// GET ALL PLATFORM USERS
export const getAllPlatformUsers = async (req, res) => {

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = {};

    // Search by name or email
    if (req.query.search?.trim()) {
        const search = escapeRegex(req.query.search.trim());

        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by User role
    if (req.query.role) {
        if (!["admin", "employee"].includes(req.query.role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role filter"
            });
        }

        filter.role = req.query.role;
    }

    // Filter by account status
    if (req.query.status) {
        if (!["active", "suspended"].includes(req.query.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account status filter"
            });
        }

        filter.accountStatus = req.query.status;
    }

    // Exclude Platform Admin accounts from normal user management
    const platformAdminIds = await PlatformAdmin.distinct("user");

    filter._id = {
        $nin: platformAdminIds
    };

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("name email role accountStatus avatar createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(filter)
    ]);

    return res.status(200).json({
        success: true,
        results: users.length,
        data: {
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                limit
            }
        }
    });
};


// GET SINGLE USER DETAILS
export const getPlatformUserDetails = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    const platformAdmin = await PlatformAdmin.findOne({
        user: id
    });

    if (platformAdmin) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const user = await User.findById(id)
        .select("name email role accountStatus bio avatar createdAt updatedAt")
        .lean();

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const memberships = await OrganizationMember.find({
        user: id
    })
        .populate("organization", "name slug status")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: {
            user,
            memberships
        }
    });
};


// SUSPEND USER
export const suspendPlatformUser = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    // Do not allow an admin to suspend their own account
    if (String(req.user._id) === String(id)) {
        return res.status(400).json({
            success: false,
            message: "You cannot suspend your own account"
        });
    }

    // Platform Admin accounts are protected
    const platformAdmin = await PlatformAdmin.findOne({
        user: id
    });

    if (platformAdmin) {
        return res.status(403).json({
            success: false,
            message: "Platform Admin accounts cannot be suspended here"
        });
    }

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if (user.accountStatus === "suspended") {
        return res.status(409).json({
            success: false,
            message: "User is already suspended"
        });
    }

    const previousStatus = user.accountStatus || "active";

    user.accountStatus = "suspended";
    await user.save();

    await PlatformAdminAuditLog.create({
        actor: req.user._id,
        action: "user.suspended",
        targetUser: user._id,
        metadata: {
            userName: user.name,
            userEmail: user.email,
            previousStatus,
            newStatus: "suspended"
        },
        ipAddress: req.ip
    });

    return res.status(200).json({
        success: true,
        message: "User suspended successfully",
        data: {
            userId: user._id,
            accountStatus: user.accountStatus
        }
    });
};


// ACTIVATE USER
export const activatePlatformUser = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    const platformAdmin = await PlatformAdmin.findOne({
        user: id
    });

    if (platformAdmin) {
        return res.status(403).json({
            success: false,
            message: "Platform Admin accounts cannot be managed here"
        });
    }

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if (user.accountStatus !== "suspended") {
        return res.status(409).json({
            success: false,
            message: "User is not suspended"
        });
    }

    user.accountStatus = "active";
    await user.save();

    await PlatformAdminAuditLog.create({
        actor: req.user._id,
        action: "user.activated",
        targetUser: user._id,
        metadata: {
            userName: user.name,
            userEmail: user.email,
            previousStatus: "suspended",
            newStatus: "active"
        },
        ipAddress: req.ip
    });

    return res.status(200).json({
        success: true,
        message: "User activated successfully",
        data: {
            userId: user._id,
            accountStatus: user.accountStatus
        }
    });
};