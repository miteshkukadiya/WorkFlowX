import mongoose from "mongoose";


const attachmentSchema =
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

            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            originalName: {
                type: String,
                required: true,
                trim: true
            },

            storedName: {
                type: String,
                required: true
            },

            mimeType: {
                type: String,
                required: true
            },

            size: {
                type: Number,
                required: true
            },

            path: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );


attachmentSchema.index({
    task: 1,
    createdAt: -1
});


const Attachment =
    mongoose.model(
        "Attachment",
        attachmentSchema
    );


export default Attachment;