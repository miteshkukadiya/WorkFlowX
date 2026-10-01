import mongoose from "mongoose";

import TimeEntry from "../models/TimeEntry.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

const canTrackTask = async (
    taskId,
    userId
) => {

    if (!mongoose.isValidObjectId(taskId)) {
        return {
            allowed: false,
            message: "Invalid task ID"
        };
    }

    const task = await Task.findById(taskId);

    if (!task) {
        return {
            allowed: false,
            message: "Task not found"
        };
    }

    const project = await Project.findById(
        task.project
    );

    if (!project) {
        return {
            allowed: false,
            message: "Project not found"
        };
    }

    const isOwner =
        String(project.owner) ===
        String(userId);

    const isAssignee =
        task.assignedTo &&
        String(task.assignedTo) ===
        String(userId);

    if (!isOwner && !isAssignee) {
        return {
            allowed: false,
            message:
                "You cannot track time for this task"
        };
    }

    return {
        allowed: true,
        task,
        project
    };
};

export const startTimer = async (
    req,
    res
) => {

    try {

        const {
            taskId,
            description
        } = req.body;


        const access =
            await canTrackTask(
                taskId,
                req.user._id
            );


        if (!access.allowed) {

            return res.status(403).json({
                success: false,
                message: access.message
            });

        }


        const existingTimer =
            await TimeEntry.findOne({
                user: req.user._id,
                isRunning: true
            });


        if (existingTimer) {

            return res.status(400).json({
                success: false,
                message:
                    "You already have a running timer"
            });

        }


        const entry =
            await TimeEntry.create({

                user: req.user._id,

                task: access.task._id,

                project: access.project._id,

                startTime: new Date(),

                description:
                    description || "",

                type: "timer",

                isRunning: true

            });


        const populatedEntry =
            await TimeEntry.findById(
                entry._id
            )
                .populate(
                    "task",
                    "title status"
                )
                .populate(
                    "project",
                    "name color"
                );


        return res.status(201).json({

            success: true,

            message:
                "Timer started successfully",

            data: populatedEntry

        });


    } catch (error) {

        if (error.code === 11000) {

            return res.status(400).json({
                success: false,
                message:
                    "You already have a running timer"
            });

        }

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const stopTimer = async (
    req,
    res
) => {

    try {

        const activeTimer =
            await TimeEntry.findOne({
                user: req.user._id,
                isRunning: true
            });


        if (!activeTimer) {

            return res.status(404).json({
                success: false,
                message:
                    "No active timer found"
            });

        }


        const endTime = new Date();

        const duration = Math.max(
            0,
            Math.floor(
                (
                    endTime -
                    activeTimer.startTime
                ) / 1000
            )
        );


        activeTimer.endTime =
            endTime;

        activeTimer.duration =
            duration;

        activeTimer.isRunning =
            false;


        await activeTimer.save();


        const entry =
            await TimeEntry.findById(
                activeTimer._id
            )
                .populate(
                    "task",
                    "title status"
                )
                .populate(
                    "project",
                    "name color"
                );


        return res.status(200).json({

            success: true,

            message:
                "Timer stopped successfully",

            data: entry

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const getActiveTimer = async (
    req,
    res
) => {

    try {

        const timer =
            await TimeEntry.findOne({
                user: req.user._id,
                isRunning: true
            })
                .populate(
                    "task",
                    "title status"
                )
                .populate(
                    "project",
                    "name color"
                );


        return res.status(200).json({

            success: true,

            data: timer

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const createManualEntry = async (
    req,
    res
) => {

    try {

        const {
            taskId,
            date,
            hours,
            minutes,
            description
        } = req.body;


        const access =
            await canTrackTask(
                taskId,
                req.user._id
            );


        if (!access.allowed) {

            return res.status(403).json({
                success: false,
                message: access.message
            });

        }


        const parsedHours =
            Number(hours || 0);

        const parsedMinutes =
            Number(minutes || 0);


        if (
            !Number.isFinite(parsedHours) ||
            !Number.isFinite(parsedMinutes) ||
            parsedHours < 0 ||
            parsedMinutes < 0 ||
            parsedMinutes > 59
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid hours or minutes"
            });

        }


        const duration =
            (
                parsedHours * 60 * 60
            ) +
            (
                parsedMinutes * 60
            );


        if (duration <= 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Time must be greater than zero"
            });

        }


        if (duration > 24 * 60 * 60) {

            return res.status(400).json({
                success: false,
                message:
                    "Manual entry cannot exceed 24 hours"
            });

        }


        const startTime =
            date
                ? new Date(
                    `${date}T12:00:00`
                )
                : new Date();


        if (
            Number.isNaN(
                startTime.getTime()
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid date"
            });

        }


        const endTime =
            new Date(
                startTime.getTime() +
                duration * 1000
            );


        const entry =
            await TimeEntry.create({

                user: req.user._id,

                task: access.task._id,

                project: access.project._id,

                startTime,

                endTime,

                duration,

                description:
                    description || "",

                type: "manual",

                isRunning: false

            });


        const populated =
            await TimeEntry.findById(
                entry._id
            )
                .populate(
                    "task",
                    "title"
                )
                .populate(
                    "project",
                    "name color"
                );


        return res.status(201).json({

            success: true,

            message:
                "Manual time added successfully",

            data: populated

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const getTimeEntries = async (
    req,
    res
) => {

    try {

        const {
            taskId,
            projectId
        } = req.query;


        const filter = {
            user: req.user._id,
            isRunning: false
        };


        if (taskId) {

            if (
                !mongoose.isValidObjectId(
                    taskId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid task ID"
                });

            }

            filter.task = taskId;

        }


        if (projectId) {

            if (
                !mongoose.isValidObjectId(
                    projectId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid project ID"
                });

            }

            filter.project =
                projectId;

        }


        const entries =
            await TimeEntry.find(filter)

                .populate(
                    "task",
                    "title status"
                )

                .populate(
                    "project",
                    "name color"
                )

                .sort({
                    startTime: -1
                });


        return res.status(200).json({

            success: true,

            count: entries.length,

            data: entries

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const getTimeSummary = async (
    req,
    res
) => {

    try {

        const now =
            new Date();


        // TODAY

        const startOfToday =
            new Date(now);

        startOfToday.setHours(
            0,
            0,
            0,
            0
        );


        // START OF WEEK - MONDAY

        const startOfWeek =
            new Date(now);

        const day =
            startOfWeek.getDay();

        const difference =
            day === 0
                ? -6
                : 1 - day;

        startOfWeek.setDate(
            startOfWeek.getDate() +
            difference
        );

        startOfWeek.setHours(
            0,
            0,
            0,
            0
        );


        const completedEntries =
            await TimeEntry.find({

                user: req.user._id,

                isRunning: false,

                startTime: {
                    $gte: startOfWeek
                }

            }).select(
                "duration startTime"
            );


        let todaySeconds = 0;

        let weekSeconds = 0;


        for (
            const entry
            of completedEntries
        ) {

            weekSeconds +=
                entry.duration || 0;


            if (
                entry.startTime >=
                startOfToday
            ) {

                todaySeconds +=
                    entry.duration || 0;

            }

        }


        return res.status(200).json({

            success: true,

            data: {

                todaySeconds,

                weekSeconds,

                weekEntries:
                    completedEntries.length

            }

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

