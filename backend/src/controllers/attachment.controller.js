import mongoose from "mongoose";

import fs from "fs/promises";

import path from "path";

import Attachment
    from "../models/Attachment.js";

import getTaskAccess
    from "../utils/getTaskAccess.js";

import logActivity
    from "../utils/logActivity.js";

import {
    uploadToCloudinary,
    deleteFromCloudinary
} from "../../services/cloudinary.service.js";



export const uploadAttachment =
    async (req, res) => {

        try {

            const {
                taskId
            } = req.params;


            const access =
                await getTaskAccess(
                    taskId,
                    req.user._id,
                    req.tenant.organizationId
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


            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please select a file"
                });

            }


            const uploaded =
                await uploadToCloudinary(
                    req.file.buffer,
                    {
                        folder: "workflowx/tasks",
                        mimeType: req.file.mimetype,
                        originalName: req.file.originalname
                    }
                );

            const attachment =
                await Attachment.create({

                    task:
                        access.task._id,

                    project:
                        access.project._id,

                    uploadedBy:
                        req.user._id,

                    originalName:
                        req.file.originalname,

                    storedName:
                        uploaded.publicId,

                    mimeType:
                        req.file.mimetype,

                    size:
                        uploaded.bytes,

                    path:
                        uploaded.url

                });


            await attachment.populate(
                "uploadedBy",
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
                    "attachment_added",

                message:
                    `attached ${req.file.originalname}`,

                metadata: {

                    attachmentId:
                        attachment._id,

                    fileName:
                        req.file.originalname

                }

            });


            return res.status(201).json({

                success: true,

                message:
                    "File uploaded successfully",

                data:
                    attachment

            });


        } catch (error) {

            return res.status(500).json({

                success: false,
                message:
                    error.message

            });

        }

    };

export const getTaskAttachments =
    async (req, res) => {

        try {

            const {
                taskId
            } = req.params;


            const access =
                await getTaskAccess(
                    taskId,
                    req.user._id,
                    req.tenant.organizationId
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


            const attachments =
                await Attachment.find({
                    task: taskId
                })

                    .populate(
                        "uploadedBy",
                        "name email"
                    )

                    .sort({
                        createdAt: -1
                    });


            return res.status(200).json({

                success: true,

                count:
                    attachments.length,

                data:
                    attachments

            });


        } catch (error) {

            return res.status(500).json({

                success: false,
                message:
                    error.message

            });

        }

    };

export const downloadAttachment =
    async (req, res) => {

        try {

            const {
                attachmentId
            } = req.params;


            if (
                !mongoose.isValidObjectId(
                    attachmentId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid attachment ID"
                });

            }


            const attachment =
                await Attachment.findById(
                    attachmentId
                );


            if (!attachment) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Attachment not found"
                });

            }


            const access =
                await getTaskAccess(
                    attachment.task,
                    req.user._id,
                    req.tenant.organizationId
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
                /^https?:\/\//i.test(
                    attachment.path
                )
            ) {
                return res.redirect(
                    attachment.path
                );
            }

            const filePath =
                path.resolve(
                    attachment.path
                );

            try {
                await fs.access(filePath);
            } catch {
                return res.status(404).json({
                    success: false,
                    message:
                        "File no longer exists"
                });
            }

            return res.download(
                filePath,
                attachment.originalName
            );


        } catch (error) {

            return res.status(500).json({

                success: false,
                message:
                    error.message

            });

        }

    };

export const deleteAttachment =
    async (req, res) => {

        try {

            const {
                attachmentId
            } = req.params;


            if (
                !mongoose.isValidObjectId(
                    attachmentId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid attachment ID"
                });

            }


            const attachment =
                await Attachment.findById(
                    attachmentId
                );


            if (!attachment) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Attachment not found"
                });

            }


            const access =
                await getTaskAccess(
                    attachment.task,
                    req.user._id,
                    req.tenant.organizationId
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


            const isUploader =
                String(
                    attachment.uploadedBy
                ) ===
                String(
                    req.user._id
                );


            if (
                !isUploader &&
                !access.isOwner
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You cannot delete this attachment"

                });

            }


            const originalName =
                attachment.originalName;


            const filePath =
                attachment.path;


            await Attachment.findByIdAndDelete(
                attachmentId
            );


            if (
                /^https?:\/\//i.test(
                    filePath
                )
            ) {
                await deleteFromCloudinary(
                    attachment.storedName,
                    attachment.mimeType
                );
            } else {
                await fs.unlink(
                    filePath
                ).catch(() => {});
            }


            await logActivity({

                task:
                    access.task._id,

                project:
                    access.project._id,

                user:
                    req.user._id,

                action:
                    "attachment_deleted",

                message:
                    `deleted attachment ${originalName}`,

                metadata: {
                    fileName:
                        originalName
                }

            });


            return res.status(200).json({

                success: true,

                message:
                    "Attachment deleted successfully"

            });


        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

};