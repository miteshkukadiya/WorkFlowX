import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        goal: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },
        status: {
            type: String,
            enum: ["planned", "active", "completed"],
            default: "planned",
            index: true
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null }
    },
    { timestamps: true }
);

sprintSchema.index({ project: 1, status: 1, createdAt: -1 });

export default mongoose.model("Sprint", sprintSchema);
