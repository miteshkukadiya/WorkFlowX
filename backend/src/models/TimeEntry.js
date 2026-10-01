import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            default: null
        },

        duration: {
            type: Number,
            min: 0,
            default: 0
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        type: {
            type: String,
            enum: ["timer", "manual"],
            default: "timer"
        },

        isRunning: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

timeEntrySchema.index({
    user: 1,
    startTime: -1
});

timeEntrySchema.index({
    task: 1
});

timeEntrySchema.index({
    project: 1
});

/*
 * A user can have only one running timer.
 */
timeEntrySchema.index(
    {
        user: 1,
        isRunning: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            isRunning: true
        }
    }
);

const TimeEntry = mongoose.model(
    "TimeEntry",
    timeEntrySchema
);

export default TimeEntry;