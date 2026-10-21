import mongoose from "mongoose";
import OrganizationMember from "../models/OrganizationMember.js";
import Organization from "../models/Organization.js";
import Project from "../models/Project.js";

export const getMembers = async (req, res, next) => {
    try {
        const members = await OrganizationMember.find({
            organization: req.tenant.organizationId
        })
            .populate("user", "name email avatar")
            .sort({ joinedAt: 1 })
            .lean();

        return res.json({
            success: true,
            data: members
        });
    } catch (error) {
        next(error);
    }
};

export const updateMemberRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!["admin", "manager", "member", "guest"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        if (!mongoose.isValidObjectId(req.params.memberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid member ID"
            });
        }

        const member = await OrganizationMember.findOne({
            _id: req.params.memberId,
            organization: req.tenant.organizationId
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        if (member.role === "owner") {
            return res.status(403).json({
                success: false,
                message: "Workspace owner role cannot be changed here"
            });
        }

        member.role = role;
        await member.save();

        return res.json({
            success: true,
            message: "Member role updated",
            data: member
        });

    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.memberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid member ID"
            });
        }

        const member = await OrganizationMember.findOne({
            _id: req.params.memberId,
            organization: req.tenant.organizationId
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        if (member.role === "owner") {
            return res.status(403).json({
                success: false,
                message: "Workspace owner cannot be removed"
            });
        }

        // Prevent removal when this user still owns projects.
        const ownedProjects = await Project.countDocuments({
            organization: req.tenant.organizationId,
            owner: member.user
        });

        if (ownedProjects > 0) {
            return res.status(409).json({
                success: false,
                message: "Transfer this member's projects before removal"
            });
        }

        await OrganizationMember.deleteOne({
            _id: member._id,
            organization: req.tenant.organizationId
        });

        return res.json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error) {
        next(error);
    }
};