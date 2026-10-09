import mongoose from "mongoose";

import Task from "../models/Task.js";
import Project from "../models/Project.js";

const allowedStatuses = [
    "todo",
    "in-progress",
    "done"
];

const allowedPriorities = [
    "low",
    "medium",
    "high",
    "urgent"
];

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchTasks = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            search = "",
            projectId,
            status,
            priority,
            assignee,
            due,
            sort = "newest"
        } = req.query;

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        // 1. Find accessible projects
        const projects = await Project.find({
            $or: [
                { owner: userId },
                { members: userId }
            ]
        }).select("_id");

        const projectIds = projects.map(
            project => project._id
        );

        // 2. Base filter
        const filter = {
            project: { $in: projectIds }
        };

        // 3. Project filter
        if (projectId) {
            if (!mongoose.isValidObjectId(projectId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid project ID"
                });
            }

            const hasAccess = projectIds.some(
                id => String(id) === String(projectId)
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: "Project access denied"
                });
            }

            filter.project = new mongoose.Types.ObjectId(
                projectId
            );
        }

        // 4. Search title and description
        const searchText = String(search).trim().slice(0, 100);

        if (searchText) {
            const regex = new RegExp(
                escapeRegex(searchText),
                "i"
            );

            filter.$or = [
                { title: regex },
                { description: regex }
            ];
        }

        // 5. Status filter
        if (status && status !== "all") {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status"
                });
            }

            filter.status = status;
        }

        // 6. Priority filter
        if (priority && priority !== "all") {
            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority"
                });
            }

            filter.priority = priority;
        }

        // 7. Assignee filter
        if (assignee === "me") {
            filter.assignedTo = userId;
        } else if (assignee === "unassigned") {
            filter.assignedTo = null;
        } else if (assignee && assignee !== "all") {
            if (!mongoose.isValidObjectId(assignee)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid assignee ID"
                });
            }

            filter.assignedTo =
                new mongoose.Types.ObjectId(assignee);
        }

        // 8. Due-date filter
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(
            startOfTomorrow.getDate() + 1
        );

        if (due === "overdue") {
            filter.dueDate = {
                $lt: startOfToday
            };
            filter.status = { $ne: "done" };
        }

        if (due === "today") {
            filter.dueDate = {
                $gte: startOfToday,
                $lt: startOfTomorrow
            };
        }

        if (due === "week") {
            const end = new Date(startOfToday);
            end.setDate(end.getDate() + 7);

            filter.dueDate = {
                $gte: startOfToday,
                $lt: end
            };
        }

        // 9. Sort
        const sortOptions = {
            newest: { createdAt: -1, _id: -1 },
            oldest: { createdAt: 1, _id: 1 },
            dueSoon: { dueDate: 1, _id: 1 },
            priority: { priority: -1, _id: -1 }
        };

        const sortBy = sortOptions[sort] || sortOptions.newest;

        // 10. Pagination
        const skip = (page - 1) * limit;

        const [tasks, total] = await Promise.all([
            Task.find(filter)
                .populate("project", "name color")
                .populate("assignedTo", "name email")
                .sort(sortBy)
                .skip(skip)
                .limit(limit)
                .lean(),

            Task.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                    hasPreviousPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Task search error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to search tasks"
        });
    }
};