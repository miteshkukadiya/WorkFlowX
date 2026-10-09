import mongoose from "mongoose";

const savedViewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },

        filters: {
            search: { type: String, default: "" },
            projectId: { type: String, default: "" },
            status: { type: String, default: "all" },
            priority: { type: String, default: "all" },
            assignee: { type: String, default: "all" },
            due: { type: String, default: "all" },
            sort: { type: String, default: "newest" },
            limit: { type: Number, default: 10 }
        }
    },
    { timestamps: true }
);

savedViewSchema.index({
    user: 1,
    name: 1
}, { unique: true });

export default mongoose.model("SavedView", savedViewSchema);