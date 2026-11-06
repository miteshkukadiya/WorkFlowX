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
                "organization.activated"
            ],
            required: true
        },

        targetOrganization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
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