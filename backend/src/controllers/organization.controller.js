import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";

const makeSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// CREATE ORGANIZATION
export const createOrganization = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (
            typeof name !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Organization name must be 2 to 100 characters"
            });
        }

        const baseSlug = makeSlug(name);

        if (!baseSlug) {
            return res.status(400).json({
                success: false,
                message: "Organization name must contain letters or numbers"
            });
        }

        const slug = `${baseSlug}-${new mongoose.Types.ObjectId()
            .toString()
            .slice(-6)}`;

        // Use a transaction so the organization and owner membership
        // are created together.
        const session = await mongoose.startSession();

        let organization;

        try {
            await session.withTransaction(async () => {
                const [created] = await Organization.create(
                    [{
                        name: name.trim(),
                        slug,
                        owner: req.user._id
                    }],
                    { session }
                );

                organization = created;

                await OrganizationMember.create(
                    [{
                        organization: created._id,
                        user: req.user._id,
                        role: "owner",
                        status: "active"
                    }],
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        return res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            data: organization
        });

    } catch (error) {
        next(error);
    }
};

// GET USER ORGANIZATIONS
export const getMyOrganizations = async (req, res, next) => {
    try {
        const memberships = await OrganizationMember.find({
            user: req.user._id,
            status: "active"
        })
            .populate({
                path: "organization",
                match: { status: "active" },
                select: "name slug owner status settings"
            })
            .sort({ createdAt: -1 })
            .lean();

        const organizations = memberships
            .filter(item => item.organization)
            .map(item => ({
                ...item.organization,
                myRole: item.role
            }));

        return res.json({
            success: true,
            data: organizations
        });

    } catch (error) {
        next(error);
    }
};

// GET CURRENT ORGANIZATION
export const getCurrentOrganization = async (req, res) => {
    return res.json({
        success: true,
        data: {
            ...req.tenant.organization.toObject(),
            myRole: req.tenant.role
        }
    });
};

// UPDATE ORGANIZATION
export const updateOrganization = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (
            typeof name !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Organization name must be 2 to 100 characters"
            });
        }

        const organization = await Organization.findByIdAndUpdate(
            req.tenant.organizationId,
            {
                $set: {
                    name: name.trim()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        return res.json({
            success: true,
            message: "Workspace updated successfully",
            data: organization
        });

    } catch (error) {
        next(error);
    }
};