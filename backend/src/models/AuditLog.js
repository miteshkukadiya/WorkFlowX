import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true,
            trim: true
        },

        targetType: {
            type: String,
            required: true
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        ipAddress: {
            type: String,
            default: null
        },

        userAgent: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

auditLogSchema.index({
    organization: 1,
    createdAt: -1
});

export default mongoose.model("AuditLog", auditLogSchema);