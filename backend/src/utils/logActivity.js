import Activity
    from "../models/Activity.js";


const logActivity = async ({
    task,
    project,
    user,
    action,
    message,
    metadata = {}
}) => {

    try {

        await Activity.create({
            task,
            project,
            user,
            action,
            message,
            metadata
        });

    } catch (error) {

        console.error(
            "Activity log error:",
            error.message
        );

    }

};


export default logActivity;