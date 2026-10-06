import Project from "../models/Project.js";
import Task from "../models/Task.js";
import TimeEntry from "../models/TimeEntry.js";

export const getDashboardReport = async (req, res) => {

        try {

            const userId = req.user._id;


            // --------------------------------
            // 1. PROJECTS USER CAN ACCESS
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


            // User has no projects.

            if (
                projectIds.length === 0
            ) {

                return res.status(200).json({

                    success: true,

                    data: {

                        summary: {
                            totalProjects: 0,
                            totalTasks: 0,
                            completedTasks: 0,
                            completionRate: 0,
                            totalTimeSeconds: 0
                        },

                        taskStatus: {
                            todo: 0,
                            inProgress: 0,
                            done: 0
                        },

                        priority: {
                            low: 0,
                            medium: 0,
                            high: 0,
                            urgent: 0
                        },

                        weeklyTime: [],

                        projectProgress: []

                    }

                });

            }


            // --------------------------------
            // 2. TASKS
            // --------------------------------

            const tasks =
                await Task.find({

                    project: {
                        $in:
                            projectIds
                    }

                })
                .select(
                    "project status priority"
                )
                .lean();


            const totalTasks =
                tasks.length;


            // --------------------------------
            // 3. STATUS COUNTS
            // --------------------------------

            const taskStatus = {

                todo: 0,

                inProgress: 0,

                done: 0

            };


            tasks.forEach(
                (task) => {

                    if (
                        task.status ===
                        "todo"
                    ) {

                        taskStatus.todo++;

                    }


                    if (
                        task.status ===
                        "in-progress"
                    ) {

                        taskStatus
                            .inProgress++;

                    }


                    if (
                        task.status ===
                        "done"
                    ) {

                        taskStatus.done++;

                    }

                }
            );


            // --------------------------------
            // 4. PRIORITY COUNTS
            // --------------------------------

            const priority = {

                low: 0,
                medium: 0,
                high: 0,
                urgent: 0

            };


            tasks.forEach(
                (task) => {

                    if (
                        priority[
                            task.priority
                        ] !== undefined
                    ) {

                        priority[
                            task.priority
                        ]++;

                    }

                }
            );


            // --------------------------------
            // 5. TOTAL TRACKED TIME
            // --------------------------------

            const timeResult =
                await TimeEntry.aggregate([
                    {
                        $match: {

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
                    ?.totalSeconds ||
                0;


            // --------------------------------
            // 6. COMPLETION RATE
            // --------------------------------

            const completedTasks =
                taskStatus.done;


            const completionRate =
                totalTasks > 0

                    ? Math.round(
                        (
                            completedTasks /
                            totalTasks
                        ) * 100
                    )

                    : 0;


            // --------------------------------
            // 7. WEEKLY TIME
            // --------------------------------

            const today =
                new Date();


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

                    project: {
                        $in:
                            projectIds
                    },

                    user:
                        userId,

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
                        date: key,

                        day:
                            date.toLocaleDateString(
                                "en-US",
                                {
                                    weekday:
                                        "short"
                                }
                            ),

                        seconds: 0
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

            const projectProgress =
                projects.map(
                    (project) => {

                        const projectTasks =
                            tasks.filter(
                                (task) =>
                                    String(
                                        task.project
                                    ) ===
                                    String(
                                        project._id
                                    )
                            );


                        const completed =
                            projectTasks.filter(
                                (task) =>
                                    task.status ===
                                    "done"
                            ).length;


                        const total =
                            projectTasks.length;


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
                );


            // --------------------------------
            // RESPONSE
            // --------------------------------

            return res.status(200).json({

                success: true,

                data: {

                    summary: {

                        totalProjects:
                            projects.length,

                        totalTasks,

                        completedTasks,

                        completionRate,

                        totalTimeSeconds

                    },

                    taskStatus,

                    priority,

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