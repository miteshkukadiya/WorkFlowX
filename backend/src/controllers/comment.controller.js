import mongoose from "mongoose";

import Comment  from "../models/Comment.js";

import getTaskAccess from "../utils/getTaskAccess.js";

import logActivity  from "../utils/logActivity.js";

import createNotification from "../utils/createNotification.js";


export const addComment = async (
    req,
    res
) => {

    try {

        const {
            taskId
        } = req.params;

        const {
            content
        } = req.body;


        if (
            !content ||
            !content.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be empty"
            });

        }


        if (
            content.trim().length > 1000
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot exceed 1000 characters"
            });

        }


        const access =
            await getTaskAccess(
                taskId,
                req.user._id
            );


        if (!access.allowed) {

            return res
                .status(access.status)
                .json({
                    success: false,
                    message:
                        access.message
                });

        }


        const comment =
            await Comment.create({

                task:
                    access.task._id,

                project:
                    access.project._id,

                user:
                    req.user._id,

                content:
                    content.trim()

            });


        const populated =
            await Comment.findById(
                comment._id
            )
                .populate(
                    "user",
                    "name email"
                );


        await logActivity({

            task:
                access.task._id,

            project:
                access.project._id,

            user:
                req.user._id,

            action:
                "comment_added",

            message:
                "added a comment"

        });

        // COMMENT NOTIFICATION
        let notificationRecipient =
            access.task.assignedTo;


        // If assignee itself commented,
        // send notification to task creator
        if (
            notificationRecipient &&
            String(notificationRecipient) ===
            String(req.user._id)
        ) {

            notificationRecipient =
                access.task.createdBy;

        }


        // CREATE NOTIFICATION
        if (notificationRecipient) {

            await createNotification({

                recipient:
                    notificationRecipient,

                sender:
                    req.user._id,

                type:
                    "comment_added",

                title:
                    "New task comment",

                message:
                    `New comment on "${access.task.title}"`,

                project:
                    access.project._id,

                task:
                    access.task._id

            });

        }



        return res.status(201).json({

            success: true,

            message:
                "Comment added successfully",

            data: populated

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const getComments = async (
    req,
    res
) => {

    try {

        const {
            taskId
        } = req.params;


        const access =
            await getTaskAccess(
                taskId,
                req.user._id
            );


        if (!access.allowed) {

            return res
                .status(access.status)
                .json({
                    success: false,
                    message:
                        access.message
                });

        }


        const comments =
            await Comment.find({
                task: taskId
            })
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: 1
                });


        return res.status(200).json({

            success: true,

            count:
                comments.length,

            data:
                comments

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const updateComment = async (
    req,
    res
) => {

    try {

        const {
            commentId
        } = req.params;

        const {
            content
        } = req.body;


        if (
            !mongoose.isValidObjectId(
                commentId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid comment ID"
            });

        }


        if (
            !content ||
            !content.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be empty"
            });

        }


        if (
            content.trim().length > 1000
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot exceed 1000 characters"
            });

        }


        const comment =
            await Comment.findById(
                commentId
            );


        if (!comment) {

            return res.status(404).json({
                success: false,
                message:
                    "Comment not found"
            });

        }


        const access =
            await getTaskAccess(
                comment.task,
                req.user._id
            );


        if (!access.allowed) {

            return res
                .status(access.status)
                .json({
                    success: false,
                    message:
                        access.message
                });

        }


        if (
            String(comment.user) !==
            String(req.user._id)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can only edit your own comment"
            });

        }


        comment.content =
            content.trim();

        comment.edited =
            true;


        await comment.save();


        await comment.populate(
            "user",
            "name email"
        );


        return res.status(200).json({

            success: true,

            message:
                "Comment updated successfully",

            data: comment

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const deleteComment = async (
    req,
    res
) => {

    try {

        const {
            commentId
        } = req.params;


        if (
            !mongoose.isValidObjectId(
                commentId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid comment ID"
            });

        }


        const comment =
            await Comment.findById(
                commentId
            );


        if (!comment) {

            return res.status(404).json({
                success: false,
                message:
                    "Comment not found"
            });

        }


        const access =
            await getTaskAccess(
                comment.task,
                req.user._id
            );


        if (!access.allowed) {

            return res
                .status(access.status)
                .json({
                    success: false,
                    message:
                        access.message
                });

        }


        const isCommentOwner =
            String(comment.user) ===
            String(req.user._id);


        if (
            !isCommentOwner &&
            !access.isOwner
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You cannot delete this comment"
            });

        }


        await Comment.findByIdAndDelete(
            commentId
        );


        await logActivity({

            task:
                access.task._id,

            project:
                access.project._id,

            user:
                req.user._id,

            action:
                "comment_deleted",

            message:
                "deleted a comment"

        });


        return res.status(200).json({

            success: true,

            message:
                "Comment deleted successfully"

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


