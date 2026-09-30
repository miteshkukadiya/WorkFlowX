import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "todo",
                "in-progress",
                "done"
            ],
            default: "todo"
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "urgent"
            ],
            default: "medium"
        },

        dueDate: {
            type: Date,
            default: null
        },

        estimatedHours: {
            type: Number,
            min: 0,
            default: 0
        },

        position: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

taskSchema.index({
    project: 1,
    status: 1,
    position: 1
});

taskSchema.index({
    assignedTo: 1
});

const Task = mongoose.model(
    "Task",
    taskSchema
);

export default Task;
