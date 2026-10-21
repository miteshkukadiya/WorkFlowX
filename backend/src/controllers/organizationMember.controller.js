import mongoose from "mongoose";
import OrganizationMember from "../models/OrganizationMember.js";
import Organization from "../models/Organization.js";
import Project from "../models/Project.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { getIO } from "../../socket/socket.js";

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

        // if (member.role === "owner") {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Workspace owner role cannot be changed here"
        //     });
        // }

        // member.role = role;
        // await member.save();

        // Check actor's workspace role
        const actorRole = req.tenant.role;

        // Workspace owner cannot be modified here
        if (member.role === "owner") {
            return res.status(403).json({
                success: false,
                message: "Owner role cannot be changed here"
            });
        }

        // Admin cannot promote members to admin
        // or modify existing admins
        if (actorRole === "admin") {
            if (
                member.role === "admin" ||
                role === "admin" ||
                role === "owner"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Admins cannot manage other admins"
                });
            }
        }

        // Update member role
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

        // if (member.role === "owner") {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Workspace owner cannot be removed"
        //     });
        // }

        
        const actorRole = req.tenant.role;

        // 1. Workspace owner cannot be removed
        if (member.role === "owner") {
            return res.status(403).json({
                success: false,
                message: "Workspace owner cannot be removed"
            });
        }

        // 2. Admin cannot remove another admin
        if (actorRole === "admin" && member.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admins cannot remove other admins"
            });
        }

        // 3. User cannot remove themselves
        if (String(member.user) === String(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "Use the leave workspace feature instead"
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

        // await OrganizationMember.deleteOne({
        //     _id: member._id,
        //     organization: req.tenant.organizationId
        // });

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const result = await OrganizationMember.deleteOne(
                    {
                        _id: member._id,
                        organization: req.tenant.organizationId,
                        user: member.user,
                        role: member.role
                    },
                    { session }
                );

                if (result.deletedCount !== 1) {
                    const error = new Error(
                        "Membership changed. Please retry."
                    );
                    error.statusCode = 409;
                    throw error;
                }

                await Project.updateMany(
                    {
                        organization: req.tenant.organizationId,
                        members: member.user
                    },
                    {
                        $pull: {
                            members: member.user
                        }
                    },
                    { session }
                );

                await writeAuditLog({
                    organizationId: req.tenant.organizationId,
                    actorId: req.user._id,
                    action: "workspace.member_removed",
                    targetType: "OrganizationMember",
                    targetId: member._id,
                    metadata: {
                        removedUserId: String(member.user),
                        previousRole: member.role
                    },
                    req,
                    session
                });
            });
        } finally {
            await session.endSession();
        }

        const io = getIO();

        if (io) {
            const userRoom = `user:${member.user}`;

            // Disconnect removed user's existing sockets
            io.in(userRoom).disconnectSockets(true);
        }


        return res.json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error) {
        next(error);
    }
};