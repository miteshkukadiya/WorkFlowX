import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getTenantProject = async ({
    projectId,
    organizationId
}) => {
    if (!mongoose.isValidObjectId(projectId)) {
        return null;
    }

    return Project.findOne({
        _id: projectId,
        organization: organizationId
    });
};

export const getTenantTask = async ({
    taskId,
    organizationId
}) => {
    if (!mongoose.isValidObjectId(taskId)) {
        return null;
    }

    const task = await Task.findById(taskId);

    if (!task) {
        return null;
    }

    const project = await getTenantProject({
        projectId: task.project,
        organizationId
    });

    if (!project) {
        return null;
    }

    return { task, project };
};