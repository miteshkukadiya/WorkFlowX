import mongoose from "mongoose";

const organizationInvitationSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["admin", "manager", "member", "guest"],
            default: "member"
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "revoked"],
            default: "pending"
        },

        expiresAt: {
            type: Date,
            required: true
        },

        acceptedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

organizationInvitationSchema.index({
    organization: 1,
    email: 1,
    status: 1
});

export default mongoose.model(
    "OrganizationInvitation",
    organizationInvitationSchema
);