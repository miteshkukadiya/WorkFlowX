import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";

export const requireTenant = async (req, res, next) => {
    try {
        const organizationId = req.header("X-Organization-Id");

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID is required"
            });
        }

        if (!mongoose.isValidObjectId(organizationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID"
            });
        }

        const organization = await Organization.findOne({
            _id: organizationId,
            status: "active"
        });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        const membership = await OrganizationMember.findOne({
            organization: organization._id,
            user: req.user._id,
            status: "active"
        });

        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this workspace"
            });
        }

        req.tenant = {
            organizationId: organization._id,
            organization,
            membership,
            role: membership.role
        };

        next();

    } catch (error) {
        next(error);
    }
};