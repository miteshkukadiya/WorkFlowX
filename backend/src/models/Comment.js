import mongoose from "mongoose";


const commentSchema =
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

            content: {
                type: String,
                required: [
                    true,
                    "Comment is required"
                ],
                trim: true,
                maxlength: 1000
            },

            edited: {
                type: Boolean,
                default: false
            }
        },
        {
            timestamps: true
        }
    );


commentSchema.index({
    task: 1,
    createdAt: 1
});


const Comment =
    mongoose.model(
        "Comment",
        commentSchema
    );


export default Comment;