import mongoose from "mongoose";

const usageRecordSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        metric: {
            type: String,
            enum: [
                "projects_created",
                "members_invited",
                "storage_bytes"
            ],
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        recordedAt: {
            type: Date,
            default: Date.now
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

usageRecordSchema.index({
    organization: 1,
    metric: 1,
    recordedAt: -1
});

export default mongoose.model(
    "UsageRecord",
    usageRecordSchema
);