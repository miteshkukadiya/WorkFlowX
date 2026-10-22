import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            enum: ["free", "pro", "business"]
        },

        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR"
        },

        interval: {
            type: String,
            enum: ["monthly"],
            default: "monthly"
        },

        limits: {
            maxProjects: {
                type: Number,
                required: true
            },

            maxMembers: {
                type: Number,
                required: true
            }
        },

        features: {
            advancedReports: {
                type: Boolean,
                default: false
            },

            timeTracking: {
                type: Boolean,
                default: false
            },

            automations: {
                type: Boolean,
                default: false
            }
        },

        razorpayPlanId: {
            type: String,
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Plan", planSchema);