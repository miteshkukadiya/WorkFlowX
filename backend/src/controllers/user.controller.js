import User from "../models/User.js";


export const searchUsers = async (req, res) => {

    try {

        const query =
            req.query.q?.trim();


        if (!query || query.length < 2) {

            return res.status(200).json({
                success: true,
                data: []
            });

        }


        const escapedQuery =
            query.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


        const users =
            await User.find({

                _id: {
                    $ne: req.user._id
                },

                $or: [

                    {
                        name: {
                            $regex:
                                escapedQuery,
                            $options: "i"
                        }
                    },

                    {
                        email: {
                            $regex:
                                escapedQuery,
                            $options: "i"
                        }
                    }

                ]

            })
                .select(
                    "_id name email role"
                )
                .limit(10);


        return res.status(200).json({

            success: true,

            data: users

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};