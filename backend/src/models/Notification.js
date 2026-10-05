import mongoose from "mongoose";


const notificationSchema =
    new mongoose.Schema(
        {
            recipient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },

            type: {
                type: String,
                required: true,
                enum: [
                    "project_member_added",
                    "task_assigned",
                    "task_status_changed",
                    "comment_added"
                ]
            },

            title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 150
            },

            message: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500
            },

            project: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
                default: null
            },

            task: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
                default: null
            },

            isRead: {
                type: Boolean,
                default: false,
                index: true
            },

            readAt: {
                type: Date,
                default: null
            }
        },
        {
            timestamps: true
        }
    );


notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1
});


const Notification =
    mongoose.model(
        "Notification",
        notificationSchema
    );


export default Notification;