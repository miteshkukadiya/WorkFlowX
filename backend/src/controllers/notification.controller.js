import mongoose from "mongoose";

import Notification from "../models/Notification.js";

export const getNotifications =
    async (req, res) => {

        try {

            const notifications =
                await Notification.find({
                    recipient:
                        req.user._id
                })

                    .populate(
                        "sender",
                        "name email"
                    )

                    .populate(
                        "project",
                        "name"
                    )

                    .populate(
                        "task",
                        "title"
                    )

                    .sort({
                        createdAt: -1
                    })

                    .limit(50);


            return res.status(200).json({

                success: true,

                count:
                    notifications.length,

                data:
                    notifications

            });


        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };

export const getUnreadCount =
    async (req, res) => {

        try {

            const count =
                await Notification.countDocuments({

                    recipient:
                        req.user._id,

                    isRead:
                        false

                });


            return res.status(200).json({

                success: true,

                data: {
                    count
                }

            });


        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };

export const markAsRead =
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (
                !mongoose.isValidObjectId(
                    id
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid notification ID"
                });

            }


            const notification =
                await Notification.findOne({

                    _id: id,

                    recipient:
                        req.user._id

                });


            if (!notification) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found"
                });

            }


            if (!notification.isRead) {

                notification.isRead =
                    true;

                notification.readAt =
                    new Date();

                await notification.save();

            }


            return res.status(200).json({

                success: true,

                message:
                    "Notification marked as read",

                data:
                    notification

            });


        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };

export const markAllAsRead =
    async (req, res) => {

        try {

            const now =
                new Date();


            const result =
                await Notification.updateMany(
                    {
                        recipient:
                            req.user._id,

                        isRead:
                            false
                    },
                    {
                        $set: {
                            isRead: true,
                            readAt: now
                        }
                    }
                );


            return res.status(200).json({

                success: true,

                message:
                    "All notifications marked as read",

                data: {
                    updated:
                        result.modifiedCount
                }

            });


        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };

export const deleteNotification =
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (
                !mongoose.isValidObjectId(
                    id
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid notification ID"
                });

            }


            const notification =
                await Notification.findOneAndDelete({

                    _id: id,

                    recipient:
                        req.user._id

                });


            if (!notification) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found"
                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Notification deleted successfully"

            });


        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };

