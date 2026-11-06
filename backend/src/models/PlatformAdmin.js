import mongoose from "mongoose";

const platformAdminSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        lastLoginAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model(
    "PlatformAdmin",
    platformAdminSchema
);