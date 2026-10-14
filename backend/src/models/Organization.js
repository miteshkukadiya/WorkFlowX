import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active"
        },

        settings: {
            timezone: {
                type: String,
                default: "Asia/Kolkata"
            },

            allowMemberInvites: {
                type: Boolean,
                default: false
            }
        }
    },
    { timestamps: true }
);

export default mongoose.model(
    "Organization",
    organizationSchema
);