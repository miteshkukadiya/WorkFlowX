import Project from "../models/Project.js";
import Task from "../models/Task.js";
import TimeEntry from "../models/TimeEntry.js";
import Activity from "../models/Activity.js";

export const getDashboard =
    async (req, res) => {

        try {

            const userId = req.user._id;


            // --------------------------------
            // 1. ACCESSIBLE PROJECTS
            // --------------------------------

            const projects =
                await Project.find({

                    $or: [
                        {
                            owner:
                                userId
                        },
                        {
                            members:
                                userId
                        }
                    ]

                })
                .select(
                    "_id name color owner"
                )
                .lean();


            const projectIds =
                projects.map(
                    (project) =>
                        project._id
                );


            // --------------------------------
            // 2. MY TASKS
            // --------------------------------

            const myTasks =
                await Task.find({

                    project: {
                        $in:
                            projectIds
                    },

                    assignedTo:
                        userId

                })
                .populate(
                    "project",
                    "name color"
                )
                .sort({
                    dueDate: 1
                })
                .lean();


            const totalMyTasks =
                myTasks.length;


            const completedTasks =
                myTasks.filter(
                    (task) =>
                        task.status ===
                        "done"
                ).length;


            const inProgressTasks =
                myTasks.filter(
                    (task) =>
                        task.status ===
                        "in-progress"
                ).length;


            const todoTasks =
                myTasks.filter(
                    (task) =>
                        task.status ===
                        "todo"
                ).length;


            // --------------------------------
            // 3. MY TOTAL TRACKED TIME
            // --------------------------------

            const timeResult =
                await TimeEntry.aggregate([
                    {
                        $match: {

                            user:
                                userId,

                            project: {
                                $in:
                                    projectIds
                            },

                            isRunning:
                                false

                        }
                    },

                    {
                        $group: {

                            _id: null,

                            totalSeconds: {
                                $sum:
                                    "$duration"
                            }

                        }
                    }
                ]);


            const totalTimeSeconds =
                timeResult[0]
                    ?.totalSeconds || 0;


            // --------------------------------
            // 4. TASKS DUE SOON
            // --------------------------------

            const now =
                new Date();


            const sevenDaysLater =
                new Date();


            sevenDaysLater.setDate(
                sevenDaysLater.getDate() +
                7
            );


            sevenDaysLater.setHours(
                23,
                59,
                59,
                999
            );


            const dueSoon =
                await Task.find({

                    project: {
                        $in:
                            projectIds
                    },

                    assignedTo:
                        userId,

                    status: {
                        $ne:
                            "done"
                    },

                    dueDate: {
                        $gte:
                            now,

                        $lte:
                            sevenDaysLater
                    }

                })
                .populate(
                    "project",
                    "name color"
                )
                .sort({
                    dueDate: 1
                })
                .limit(5)
                .lean();


            // --------------------------------
            // 5. OVERDUE TASKS
            // --------------------------------

            const overdueTasks =
                await Task.find({

                    project: {
                        $in:
                            projectIds
                    },

                    assignedTo:
                        userId,

                    status: {
                        $ne:
                            "done"
                    },

                    dueDate: {
                        $lt:
                            now
                    }

                })
                .populate(
                    "project",
                    "name color"
                )
                .sort({
                    dueDate: 1
                })
                .limit(5)
                .lean();


            // --------------------------------
            // 6. RECENT ACTIVITY
            // --------------------------------

            const recentActivity =
                await Activity.find({

                    project: {
                        $in:
                            projectIds
                    }

                })
                .populate(
                    "user",
                    "name email"
                )
                .populate(
                    "task",
                    "title"
                )
                .populate(
                    "project",
                    "name"
                )
                .sort({
                    createdAt: -1
                })
                .limit(8)
                .lean();


            // --------------------------------
            // 7. WEEKLY TIME
            // --------------------------------

            const startDate =
                new Date();


            startDate.setHours(
                0,
                0,
                0,
                0
            );


            startDate.setDate(
                startDate.getDate() -
                6
            );


            const weeklyEntries =
                await TimeEntry.find({

                    user:
                        userId,

                    project: {
                        $in:
                            projectIds
                    },

                    isRunning:
                        false,

                    startTime: {
                        $gte:
                            startDate
                    }

                })
                .select(
                    "startTime duration"
                )
                .lean();


            const weeklyMap =
                new Map();


            for (
                let index = 0;
                index < 7;
                index++
            ) {

                const date =
                    new Date(
                        startDate
                    );


                date.setDate(
                    startDate.getDate() +
                    index
                );


                const key =
                    date
                        .toISOString()
                        .slice(
                            0,
                            10
                        );


                weeklyMap.set(
                    key,
                    {
                        date:
                            key,

                        day:
                            date.toLocaleDateString(
                                "en-US",
                                {
                                    weekday:
                                        "short"
                                }
                            ),

                        seconds:
                            0
                    }
                );

            }


            weeklyEntries.forEach(
                (entry) => {

                    const key =
                        new Date(
                            entry.startTime
                        )
                            .toISOString()
                            .slice(
                                0,
                                10
                            );


                    if (
                        weeklyMap.has(
                            key
                        )
                    ) {

                        weeklyMap.get(
                            key
                        ).seconds +=
                            entry.duration;

                    }

                }
            );


            const weeklyTime =
                Array.from(
                    weeklyMap.values()
                ).map(
                    (item) => ({

                        ...item,

                        hours:
                            Number(
                                (
                                    item.seconds /
                                    3600
                                ).toFixed(2)
                            )

                    })
                );


            // --------------------------------
            // 8. PROJECT PROGRESS
            // --------------------------------

            const allProjectTasks =
                await Task.find({

                    project: {
                        $in:
                            projectIds
                    }

                })
                .select(
                    "project status"
                )
                .lean();


            const projectProgress =
                projects.map(
                    (project) => {

                        const tasks =
                            allProjectTasks.filter(
                                (task) =>
                                    String(
                                        task.project
                                    ) ===
                                    String(
                                        project._id
                                    )
                            );


                        const total =
                            tasks.length;


                        const completed =
                            tasks.filter(
                                (task) =>
                                    task.status ===
                                    "done"
                            ).length;


                        const progress =
                            total > 0
                                ? Math.round(
                                    (
                                        completed /
                                        total
                                    ) * 100
                                )
                                : 0;


                        return {

                            _id:
                                project._id,

                            name:
                                project.name,

                            color:
                                project.color,

                            totalTasks:
                                total,

                            completedTasks:
                                completed,

                            progress

                        };

                    }
                )
                .sort(
                    (a, b) =>
                        b.progress -
                        a.progress
                )
                .slice(
                    0,
                    5
                );


            // --------------------------------
            // RESPONSE
            // --------------------------------

            return res.status(200).json({

                success: true,

                data: {

                    stats: {

                        totalProjects:
                            projects.length,

                        totalMyTasks,

                        completedTasks,

                        totalTimeSeconds,

                        overdueCount:
                            overdueTasks.length

                    },


                    taskOverview: {

                        todo:
                            todoTasks,

                        inProgress:
                            inProgressTasks,

                        done:
                            completedTasks

                    },


                    dueSoon,

                    overdueTasks,

                    recentActivity,

                    weeklyTime,

                    projectProgress

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