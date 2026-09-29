import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "planning",
                "active",
                "on-hold",
                "completed"
            ],
            default: "planning"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        startDate: {
            type: Date,
            default: Date.now
        },

        endDate: {
            type: Date,
            default: null
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        color: {
            type: String,
            default: "#6366f1"
        }
    },
    {
        timestamps: true
    }
);

projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ members: 1 });

const Project = mongoose.model(
    "Project",
    projectSchema
);

export default Project;