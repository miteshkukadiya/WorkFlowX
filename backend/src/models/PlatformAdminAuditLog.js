import mongoose from "mongoose";

const platformAdminAuditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        action: {
            type: String,
            enum: [
                "organization.suspended",
                "organization.activated",
                "user.suspended",
                "user.activated"
            ],
            required: true
        },

        targetOrganization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
            index: true
        },

        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        ipAddress: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

platformAdminAuditLogSchema.index({
    createdAt: -1
});

export default mongoose.model(
    "PlatformAdminAuditLog",
    platformAdminAuditLogSchema
);