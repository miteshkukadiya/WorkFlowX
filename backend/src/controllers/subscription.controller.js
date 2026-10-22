import Plan from "../models/Plan.js";
import Project from "../models/Project.js";
import OrganizationMember from "../models/OrganizationMember.js";
import OrganizationInvitation from "../models/OrganizationInvitation.js";

import {
    getWorkspaceSubscription,
    isSubscriptionActive
} from "../../services/subscription.service.js";

export const getPlans = async (req, res, next) => {
    try {
        const plans = await Plan.find({
            isActive: true
        })
            .select("-razorpayPlanId")
            .sort({ price: 1 })
            .lean();

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

export const getMySubscription = async (req, res, next) => {
    try {
        const organizationId = req.tenant.organizationId;

        const subscription =
            await getWorkspaceSubscription(organizationId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Workspace subscription not initialized"
            });
        }

        const [projects, members, invitations] =
            await Promise.all([
                Project.countDocuments({
                    organization: organizationId
                }),

                OrganizationMember.countDocuments({
                    organization: organizationId,
                    status: "active"
                }),

                OrganizationInvitation.countDocuments({
                    organization: organizationId,
                    status: "pending",
                    expiresAt: { $gt: new Date() }
                })
            ]);

        return res.json({
            success: true,
            data: {
                subscription: {
                    plan: subscription.plan,
                    status: subscription.status,
                    provider: subscription.provider,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    trialEndsAt: subscription.trialEndsAt,
                    cancelAtPeriodEnd:
                        subscription.cancelAtPeriodEnd,
                    hasAccess: isSubscriptionActive(subscription)
                },
                usage: {
                    projects,
                    members,
                    pendingInvitations: invitations
                }
            }
        });
    } catch (error) {
        next(error);
    }
};