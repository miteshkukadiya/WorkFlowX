import mongoose from "mongoose";


const activitySchema =
    new mongoose.Schema(
        {
            task: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
                required: true,
                index: true
            },

            project: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
                required: true,
                index: true
            },

            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            action: {
                type: String,
                required: true,
                enum: [
                    "task_created",
                    "status_changed",
                    "priority_changed",
                    "assignee_changed",
                    "title_changed",
                    "comment_added",
                    "comment_deleted"
                ]
            },

            message: {
                type: String,
                required: true,
                trim: true
            },

            metadata: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            }
        },
        {
            timestamps: true
        }
    );


activitySchema.index({
    task: 1,
    createdAt: -1
});


const Activity =
    mongoose.model(
        "Activity",
        activitySchema
    );


export default Activity;