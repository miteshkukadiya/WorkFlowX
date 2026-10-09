import Notification from "../models/Notification.js";
import { emitToUser } from "./socketEvents.js";
import User from "../models/User.js";




const createNotification = async ({
    recipient,
    sender = null,
    type,
    title,
    message,
    project = null,
    task = null
}) => {

    try {

        if (!recipient) {
            return null;
        }


        // Do not notify yourself.

        if (
            sender &&
            String(recipient) ===
            String(sender)
        ) {
            return null;
        }

        // CHECK USER NOTIFICATION PREFERENCES

        const recipientUser = await User.findById(recipient)
            .select("preferences.notifications");

        if (!recipientUser) {
            return null;
        }

        const preferenceMap = {
            task_assigned: "taskAssigned",
            task_status_changed: "taskStatusChanged",
            comment_added: "comments",
            project_member_added: "projectInvites"
        };

        const preferenceKey = preferenceMap[type];

        if (
            preferenceKey &&
            recipientUser.preferences?.notifications?.[preferenceKey] === false
        ) {
            return null;
        }


        const notification =
            await Notification.create({

                recipient,
                sender,
                type,
                title,
                message,
                project,
                task

            });

        const populatedNotification = await Notification.findById(
            notification._id
        )
            .populate("sender", "name email")
            .populate("project", "name")
            .populate("task", "title");

        emitToUser(
            recipient,
            "notification:new",
            populatedNotification
        );


        return notification;


    } catch (error) {

        console.error(
            "Notification creation error:",
            error.message
        );

        return null;

    }

};


export default createNotification;