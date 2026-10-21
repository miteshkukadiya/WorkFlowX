import crypto from "crypto";
import mongoose from "mongoose";

import User from "../models/User.js";
import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";
import OrganizationInvitation from "../models/OrganizationInvitation.js";
import { WORKSPACE_LIMITS } from "../config/workspaceLimits.js";

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email) =>
    email.trim().toLowerCase();

// POST /api/v1/workspace-invitations
export const createInvitation = async (req, res, next) => {
    try {
        const { email, role = "member" } = req.body;

        if (
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email is required"
            });
        }

        if (!["admin", "manager", "member", "guest"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invitation role"
            });
        }

        const normalizedEmail = normalizeEmail(email);

        const existingUser = await User.findOne({
            email: normalizedEmail
        }).select("_id");

        if (existingUser) {
            const membership = await OrganizationMember.findOne({
                organization: req.tenant.organizationId,
                user: existingUser._id
            });

            if (membership) {
                return res.status(409).json({
                    success: false,
                    message: "User already belongs to this workspace"
                });
            }
        }

        const pending = await OrganizationInvitation.findOne({
            organization: req.tenant.organizationId,
            email: normalizedEmail,
            status: "pending",
            expiresAt: { $gt: new Date() }
        });

        if (pending) {
            return res.status(409).json({
                success: false,
                message: "An active invitation already exists"
            });
        }

        
        const organizationId = req.tenant.organizationId;

        // Count active workspace members
        const activeMembers = await OrganizationMember.countDocuments({
            organization: organizationId,
            status: "active"
        });

        // Count valid pending invitations
        const pendingInvitations =
            await OrganizationInvitation.countDocuments({
                organization: organizationId,
                status: "pending",
                expiresAt: { $gt: new Date() }
            });

        // Check maximum workspace members
        if (
            activeMembers + pendingInvitations >=
            WORKSPACE_LIMITS.maxMembers
        ) {
            return res.status(403).json({
                success: false,
                message: "Workspace member limit reached"
            });
        }

        // Check maximum pending invitations
        if (
            pendingInvitations >=
            WORKSPACE_LIMITS.maxPendingInvitations
        ) {
            return res.status(429).json({
                success: false,
                message: "Too many pending invitations"
            });
        }


        const token = crypto.randomBytes(32).toString("hex");



        const invitation = await OrganizationInvitation.create({
            organization: req.tenant.organizationId,
            email: normalizedEmail,
            role,
            tokenHash: hashToken(token),
            invitedBy: req.user._id,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        });

        // DEVELOPMENT ONLY:
        // The invitation URL must be emailed privately in production.
        const invitationUrl =
            `${process.env.FRONTEND_URL}/invitations/accept?token=${token}`;

        return res.status(201).json({
            success: true,
            message: "Invitation created",
            data: {
                _id: invitation._id,
                email: invitation.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt,
                ...(process.env.NODE_ENV !== "production"
                    ? { invitationUrl }
                    : {})
            }
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/v1/workspace-invitations
export const getInvitations = async (req, res, next) => {
    try {
        const invitations = await OrganizationInvitation.find({
            organization: req.tenant.organizationId,
            status: "pending"
        })
            .select("email role expiresAt invitedBy createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            data: invitations
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/v1/workspace-invitations/accept
export const acceptInvitation = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        const { token } = req.body;

        if (
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/.test(token)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid invitation token"
            });
        }

        const user = await User.findById(req.user._id)
            .select("email");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Account not found"
            });
        }

        let organizationId;

        await session.withTransaction(async () => {
            const invitation = await OrganizationInvitation.findOne({
                tokenHash: hashToken(token),
                status: "pending",
                expiresAt: { $gt: new Date() }
            })
                .select("+tokenHash")
                .session(session);

            if (!invitation) {
                const error = new Error("Invitation expired or invalid");
                error.statusCode = 400;
                throw error;
            }

            if (
                normalizeEmail(user.email) !== invitation.email
            ) {
                const error = new Error(
                    "This invitation belongs to another email address"
                );
                error.statusCode = 403;
                throw error;
            }

            const organization = await Organization.findOne({
                _id: invitation.organization,
                status: "active"
            }).session(session);

            if (!organization) {
                const error = new Error("Workspace unavailable");
                error.statusCode = 404;
                throw error;
            }

            const membership = await OrganizationMember.findOne({
                organization: invitation.organization,
                user: user._id
            }).session(session);

            if (membership) {
                const error = new Error(
                    "User already has a workspace membership"
                );
                error.statusCode = 409;
                throw error;
            }

            await OrganizationMember.create(
                [{
                    organization: invitation.organization,
                    user: user._id,
                    role: invitation.role,
                    status: "active"
                }],
                { session }
            );

            invitation.status = "accepted";
            invitation.acceptedAt = new Date();

            await invitation.save({ session });

            organizationId = invitation.organization;
        });

        return res.json({
            success: true,
            message: "Invitation accepted successfully",
            data: { organizationId }
        });

    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
};

// DELETE /api/v1/workspace-invitations/:id
export const revokeInvitation = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invitation ID"
            });
        }

        const invitation = await OrganizationInvitation.findOneAndUpdate(
            {
                _id: req.params.id,
                organization: req.tenant.organizationId,
                status: "pending"
            },
            { $set: { status: "revoked" } },
            { new: true }
        );

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Pending invitation not found"
            });
        }

        return res.json({
            success: true,
            message: "Invitation revoked"
        });

    } catch (error) {
        next(error);
    }
};