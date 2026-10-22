import Project from "../models/Project.js";
import OrganizationMember from "../models/OrganizationMember.js";
import OrganizationInvitation from "../models/OrganizationInvitation.js";

import {
    getWorkspaceSubscription,
    isSubscriptionActive
} from "../../services/subscription.service.js";

export const requireFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const subscription =
                await getWorkspaceSubscription(
                    req.tenant.organizationId
                );

            if (!isSubscriptionActive(subscription)) {
                return res.status(402).json({
                    success: false,
                    code: "SUBSCRIPTION_INACTIVE",
                    message: "An active subscription is required"
                });
            }

            if (
                subscription.plan.features?.[featureName] !== true
            ) {
                return res.status(403).json({
                    success: false,
                    code: "FEATURE_NOT_INCLUDED",
                    message: "Upgrade your plan to use this feature"
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const checkProjectLimit = async (req, res, next) => {
    try {
        const organizationId = req.tenant.organizationId;

        const subscription =
            await getWorkspaceSubscription(organizationId);

        if (!isSubscriptionActive(subscription)) {
            return res.status(402).json({
                success: false,
                message: "Active subscription required"
            });
        }

        const max = subscription.plan.limits.maxProjects;

        const current = await Project.countDocuments({
            organization: organizationId
        });

        if (max !== -1 && current >= max) {
            return res.status(403).json({
                success: false,
                code: "PROJECT_LIMIT_REACHED",
                message: "Project limit reached. Upgrade your plan."
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkMemberLimit = async (req, res, next) => {
    try {
        const organizationId = req.tenant.organizationId;

        const subscription =
            await getWorkspaceSubscription(organizationId);

        if (!isSubscriptionActive(subscription)) {
            return res.status(402).json({
                success: false,
                message: "Active subscription required"
            });
        }

        const [members, pendingInvitations] = await Promise.all([
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

        const max = subscription.plan.limits.maxMembers;

        if (
            max !== -1 &&
            members + pendingInvitations >= max
        ) {
            return res.status(403).json({
                success: false,
                code: "MEMBER_LIMIT_REACHED",
                message: "Workspace member limit reached"
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};