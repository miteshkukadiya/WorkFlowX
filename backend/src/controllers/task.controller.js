import mongoose from "mongoose";

import Task from "../models/Task.js";

import Project from "../models/Project.js";


// CHECK PROJECT ACCESS

const hasProjectAccess = (project, userId) => {

    const isOwner =
        String(project.owner) === String(userId);

    const isMember = project.members.some(
        (member) => String(member) === String(userId)
    );

    return isOwner || isMember;
};


// CREATE TASK

export const createTask = async (req, res) => {

    try {

        const {
            title,
            description,
            projectId,
            assignedTo,
            status,
            priority,
            dueDate,
            estimatedHours
        } = req.body;

        if (!title?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });

        }

        if (!mongoose.isValidObjectId(projectId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });

        }

        const project = await Project.findById(projectId);

        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found"
            });

        }

        const isOwner =
            String(project.owner) === String(req.user._id);

        if (!isOwner) {

            return res.status(403).json({
                success: false,
                message: "Only the project owner can create tasks"
            });

        }

        // VALIDATE ASSIGNED USER

        if (assignedTo) {

            if (!mongoose.isValidObjectId(assignedTo)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid assigned user ID"
                });

            }

            const validAssignee = [
                project.owner,
                ...project.members
            ].some(
                (member) =>
                    String(member) === String(assignedTo)
            );

            if (!validAssignee) {

                return res.status(400).json({
                    success: false,
                    message: "Assigned user must belong to this project"
                });

            }

        }

        const task = await Task.create({

            title,

            description,

            project: projectId,

            assignedTo: assignedTo || null,

            createdBy: req.user._id,

            status,

            priority,

            dueDate: dueDate || null,

            estimatedHours

        });

        const populatedTask = await Task.findById(task._id)
            .populate("project", "name")
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: populatedTask
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// GET TASKS

export const getTasks = async (req, res) => {

    try {

        const { projectId, status, priority } = req.query;

        const accessibleProjects = await Project.find({

            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]

        }).select("_id");

        const projectIds = accessibleProjects.map(
            (project) => project._id
        );

        const filter = {
            project: {
                $in: projectIds
            }
        };

        if (projectId) {

            if (!mongoose.isValidObjectId(projectId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid project ID"
                });

            }

            const accessible = projectIds.some(
                (id) => String(id) === String(projectId)
            );

            if (!accessible) {

                return res.status(403).json({
                    success: false,
                    message: "Project access denied"
                });

            }

            filter.project = projectId;

        }

        if (status) {
            filter.status = status;
        }

        if (priority) {
            filter.priority = priority;
        }

        const tasks = await Task.find(filter)
            .populate("project", "name color owner")
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({
                status: 1,
                position: 1,
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// GET SINGLE TASK

export const getTaskById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });

        }

        const task = await Task.findById(id)
            .populate("project")
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }

        if (!hasProjectAccess(task.project, req.user._id)) {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        }

        return res.status(200).json({
            success: true,
            data: task
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// UPDATE TASK

export const updateTask = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });

        }

        const task = await Task.findById(id);

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }

        const project = await Project.findById(task.project);

        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found"
            });

        }

        const isOwner =
            String(project.owner) === String(req.user._id);

        const isAssignee =
            task.assignedTo &&
            String(task.assignedTo) === String(req.user._id);


        // ASSIGNEE CAN UPDATE STATUS ONLY

        if (!isOwner) {

            if (!isAssignee) {

                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });

            }

            const fields = Object.keys(req.body);

            if (
                fields.length !== 1 ||
                fields[0] !== "status"
            ) {

                return res.status(403).json({
                    success: false,
                    message: "You can only update task status"
                });

            }

            task.status = req.body.status;

        } else {

            const allowedFields = [
                "title",
                "description",
                "status",
                "priority",
                "dueDate",
                "estimatedHours",
                "assignedTo"
            ];

            for (const field of allowedFields) {

                if (req.body[field] !== undefined) {

                    task[field] = req.body[field];

                }

            }

            if (!task.title?.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Task title is required"
                });

            }

            if (task.assignedTo) {

                const validAssignee = [
                    project.owner,
                    ...project.members
                ].some(
                    (member) =>
                        String(member) === String(task.assignedTo)
                );

                if (!validAssignee) {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid project assignee"
                    });

                }

            }

        }

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("project", "name color")
            .populate("assignedTo", "name email");

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// DELETE TASK

export const deleteTask = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });

        }

        const task = await Task.findById(id);

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }

        const project = await Project.findById(task.project);

        if (
            !project ||
            String(project.owner) !== String(req.user._id)
        ) {

            return res.status(403).json({
                success: false,
                message: "Only the project owner can delete tasks"
            });

        }

        await task.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const moveTask = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            status,
            position
        } = req.body;


        // VALIDATE TASK ID

        if (!mongoose.isValidObjectId(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });

        }


        // VALIDATE STATUS

        const allowedStatuses = [
            "todo",
            "in-progress",
            "done"
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid task status"
            });

        }


        // VALIDATE POSITION

        const parsedPosition = Number(position);

        if (
            !Number.isFinite(parsedPosition) ||
            parsedPosition < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid task position"
            });

        }


        // FIND TASK

        const task = await Task.findById(id);

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }


        // FIND PROJECT

        const project = await Project.findById(
            task.project
        );

        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found"
            });

        }


        // CHECK PERMISSION

        const isOwner =
            String(project.owner) ===
            String(req.user._id);

        const isAssignedUser =
            task.assignedTo &&
            String(task.assignedTo) ===
            String(req.user._id);


        if (!isOwner && !isAssignedUser) {

            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to move this task"
            });

        }


        // UPDATE

        task.status = status;

        task.position = parsedPosition;

        await task.save();


        const updatedTask = await Task.findById(
            task._id
        )
            .populate(
                "project",
                "name color owner"
            )
            .populate(
                "assignedTo",
                "name email"
            );


        return res.status(200).json({

            success: true,

            message:
                "Task moved successfully",

            data: updatedTask

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// export const reorderTasks = async (req, res) => {

//     try {

//         const {
//             projectId,
//             tasks
//         } = req.body;


//         if (
//             !mongoose.isValidObjectId(
//                 projectId
//             )
//         ) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Invalid project ID"
//             });

//         }


//         if (
//             !Array.isArray(tasks) ||
//             tasks.length === 0
//         ) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Tasks array is required"
//             });

//         }


//         const project =
//             await Project.findById(
//                 projectId
//             );


//         if (!project) {

//             return res.status(404).json({
//                 success: false,
//                 message:
//                     "Project not found"
//             });

//         }


//         const hasAccess =

//             String(project.owner) ===
//             String(req.user._id)

//             ||

//             project.members.some(
//                 (member) =>
//                     String(member) ===
//                     String(req.user._id)
//             );


//         if (!hasAccess) {

//             return res.status(403).json({
//                 success: false,
//                 message:
//                     "Project access denied"
//             });

//         }


//         const allowedStatuses = [
//             "todo",
//             "in-progress",
//             "done"
//         ];


//         const operations = [];


//         for (
//             let index = 0;
//             index < tasks.length;
//             index++
//         ) {

//             const item = tasks[index];


//             if (
//                 !mongoose.isValidObjectId(
//                     item._id
//                 )
//             ) {

//                 return res.status(400).json({
//                     success: false,
//                     message:
//                         "Invalid task ID"
//                 });

//             }


//             if (
//                 !allowedStatuses.includes(
//                     item.status
//                 )
//             ) {

//                 return res.status(400).json({
//                     success: false,
//                     message:
//                         "Invalid task status"
//                 });

//             }


//             operations.push({

//                 updateOne: {

//                     filter: {
//                         _id: item._id,
//                         project: projectId
//                     },

//                     update: {
//                         $set: {
//                             status:
//                                 item.status,

//                             position:
//                                 index
//                         }
//                     }

//                 }

//             });

//         }


//         await Task.bulkWrite(
//             operations
//         );


//         return res.status(200).json({

//             success: true,

//             message:
//                 "Task order updated successfully"

//         });


//     } catch (error) {

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };

export const reorderTasks = async (req, res) => {

    try {

        const {
            projectId,
            tasks
        } = req.body;


        // VALIDATE PROJECT ID

        if (
            !mongoose.isValidObjectId(
                projectId
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });

        }


        // VALIDATE TASKS ARRAY

        if (
            !Array.isArray(tasks) ||
            tasks.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Tasks array is required"
            });

        }


        // FIND PROJECT

        const project =
            await Project.findById(
                projectId
            );


        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found"
            });

        }


        // ALLOWED TASK STATUSES

        const allowedStatuses = [
            "todo",
            "in-progress",
            "done"
        ];


        const operations = [];


        // VALIDATE EVERY TASK

        for (
            let index = 0;
            index < tasks.length;
            index++
        ) {

            const item = tasks[index];


            // VALIDATE TASK ID

            if (
                !mongoose.isValidObjectId(
                    item._id
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid task ID"
                });

            }


            // VALIDATE STATUS

            if (
                !allowedStatuses.includes(
                    item.status
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid task status"
                });

            }


            // FIND TASK FROM SAME PROJECT

            const existingTask =
                await Task.findOne({
                    _id: item._id,
                    project: projectId
                });


            if (!existingTask) {

                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });

            }


            // CHECK PERMISSION

            const isOwner =
                String(project.owner) ===
                String(req.user._id);


            const isAssignee =
                existingTask.assignedTo &&
                String(existingTask.assignedTo) ===
                String(req.user._id);


            if (!isOwner && !isAssignee) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot move this task"
                });

            }


            // PREPARE DATABASE UPDATE

            operations.push({

                updateOne: {

                    filter: {
                        _id: item._id,
                        project: projectId
                    },

                    update: {

                        $set: {

                            status:
                                item.status,

                            position:
                                index

                        }

                    }

                }

            });

        }


        // UPDATE ALL TASK POSITIONS

        await Task.bulkWrite(
            operations
        );


        return res.status(200).json({

            success: true,

            message:
                "Task order updated successfully"

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};