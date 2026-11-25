import crypto from "crypto";
import mongoose from "mongoose";

import User from "../models/User.js";
import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";
import OrganizationInvitation from "../models/OrganizationInvitation.js";
import cacheService from "../../services/cache.service.js";
import { sendEmail } from "../services/email.service.js";
import { WORKSPACE_LIMITS } from "../config/workspaceLimits.js";

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email) =>
    email.trim().toLowerCase();

const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);

const sendInvitationEmail = async ({ email, role, workspaceName, token }) => {
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");
    const invitationUrl =
        `${frontendUrl}/invitations/accept?token=${token}`;
    const emailText = [
        `You have been invited to join ${workspaceName} on WorkFlowX.`,
        `Role: ${role}`,
        "This invitation expires in 7 days.",
        `Accept the invitation: ${invitationUrl}`
    ].join("\n\n");

    return sendEmail({
        to: email,
        subject: `Invitation to join ${workspaceName} on WorkFlowX`,
        text: emailText,
        html: `<p>You have been invited to join <strong>${escapeHtml(workspaceName)}</strong> on WorkFlowX.</p><p>Role: ${escapeHtml(role)}</p><p>This invitation expires in 7 days.</p><p><a href="${invitationUrl}">Accept invitation</a></p>`
    });
};

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
        const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");
        const invitationUrl =
            `${frontendUrl}/invitations/accept?token=${token}`;

        const organization = await Organization.findById(organizationId)
            .select("name")
            .lean();
        const workspaceName = organization?.name || "a WorkFlowX workspace";

        let emailSent = false;
        try {
            emailSent = await sendInvitationEmail({
                email: normalizedEmail,
                role,
                workspaceName,
                token
            });
        } catch (error) {
            console.error("Invitation email delivery failed:", error.message);
        }

        if (!emailSent && process.env.NODE_ENV === "production") {
            await invitation.deleteOne();
            return res.status(503).json({
                success: false,
                message: "Invitation email could not be sent. Check the SMTP configuration and try again."
            });
        }

        return res.status(201).json({
            success: true,
            message: emailSent
                ? "Invitation email accepted by the SMTP server. Check Inbox and Spam/Junk if it is not visible."
                : "Invitation created, but email is unavailable. Share the development link below.",
            data: {
                _id: invitation._id,
                email: invitation.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt,
                emailSent,
                ...(process.env.NODE_ENV !== "production"
                    ? { invitationUrl }
                    : {})
            }
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/v1/workspace-invitations/:id/resend
export const resendInvitation = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invitation ID"
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const invitation = await OrganizationInvitation.findOneAndUpdate(
            {
                _id: req.params.id,
                organization: req.tenant.organizationId,
                status: "pending",
                expiresAt: { $gt: new Date() }
            },
            {
                $set: {
                    tokenHash: hashToken(token),
                    expiresAt: new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                    )
                }
            },
            { new: true }
        );

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Active pending invitation not found"
            });
        }

        const organization = await Organization.findById(
            invitation.organization
        ).select("name").lean();
        const workspaceName = organization?.name || "a WorkFlowX workspace";

        try {
            const emailSent = await sendInvitationEmail({
                email: invitation.email,
                role: invitation.role,
                workspaceName,
                token
            });

            if (!emailSent) {
                throw new Error("SMTP configuration is incomplete");
            }
        } catch (error) {
            console.error("Invitation email resend failed:", error.message);
            return res.status(503).json({
                success: false,
                message: "Invitation email could not be sent. Check the SMTP configuration and try again."
            });
        }

        return res.json({
            success: true,
            message: "Invitation email accepted by the SMTP server. Check Inbox and Spam/Junk if it is not visible.",
            data: {
                _id: invitation._id,
                email: invitation.email,
                expiresAt: invitation.expiresAt,
                emailSent: true
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
            status: "pending",
            expiresAt: { $gt: new Date() }
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

        await cacheService.delete(`workflowx:members:${organizationId}`);

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