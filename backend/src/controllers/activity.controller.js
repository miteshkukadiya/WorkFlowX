import Activity
    from "../models/Activity.js";

import getTaskAccess
    from "../utils/getTaskAccess.js";


export const getTaskActivities =
    async (req, res) => {

        try {

            const {
                taskId
            } = req.params;


            const access =
                await getTaskAccess(
                    taskId,
                    req.user._id
                );


            if (!access.allowed) {

                return res
                    .status(access.status)
                    .json({
                        success: false,
                        message:
                            access.message
                    });

            }


            const activities =
                await Activity.find({
                    task: taskId
                })

                    .populate(
                        "user",
                        "name email"
                    )

                    .sort({
                        createdAt: -1
                    });


            return res.status(200).json({

                success: true,

                count:
                    activities.length,

                data:
                    activities

            });


        } catch (error) {

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });

        }

    };