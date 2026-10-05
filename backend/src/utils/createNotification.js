import Notification from "../models/Notification.js";


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