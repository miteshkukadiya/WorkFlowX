import Activity from "../models/Activity.js";

import { emitToProject } from "./socketEvents.js";


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

        emitToProject(
            project,
            "activity:created",
            {
                taskId: String(task),
                projectId: String(project)
            }
        );

    } catch (error) {

        console.error(
            "Activity log error:",
            error.message
        );

    }

};


export default logActivity;