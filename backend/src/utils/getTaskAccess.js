import mongoose from "mongoose";

import Task
    from "../models/Task.js";

import Project
    from "../models/Project.js";


const getTaskAccess = async (
    taskId,
    userId
) => {

    if (
        !mongoose.isValidObjectId(
            taskId
        )
    ) {

        return {
            allowed: false,
            status: 400,
            message: "Invalid task ID"
        };

    }


    const task =
        await Task.findById(
            taskId
        );


    if (!task) {

        return {
            allowed: false,
            status: 404,
            message: "Task not found"
        };

    }


    const project =
        await Project.findById(
            task.project
        );


    if (!project) {

        return {
            allowed: false,
            status: 404,
            message: "Project not found"
        };

    }


    const isOwner =
        String(project.owner) ===
        String(userId);


    const isMember =
        project.members.some(
            (member) =>
                String(member) ===
                String(userId)
        );


    if (!isOwner && !isMember) {

        return {
            allowed: false,
            status: 403,
            message:
                "You do not have access to this task"
        };

    }


    return {
        allowed: true,
        task,
        project,
        isOwner,
        isMember
    };

};


export default getTaskAccess;