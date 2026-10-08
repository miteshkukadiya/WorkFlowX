import {
    Activity
} from "lucide-react";


const formatTime = (
    date
) => {

    const difference =
        Math.floor(
            (
                Date.now() -
                new Date(
                    date
                ).getTime()
            ) / 1000
        );


    if (
        difference < 60
    ) {
        return "Just now";
    }


    if (
        difference < 3600
    ) {

        return `${Math.floor(
            difference / 60
        )}m ago`;

    }


    if (
        difference < 86400
    ) {

        return `${Math.floor(
            difference / 3600
        )}h ago`;

    }


    return new Date(
        date
    ).toLocaleDateString(
        "en-IN"
    );

};


export default function RecentActivity({
    activities = []
}) {

    return (

        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
        ">

            <div className="
                border-b
                border-slate-100
                px-6
                py-5
            ">

                <h2 className="
                    font-bold
                    text-slate-900
                ">

                    Recent Activity

                </h2>


                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">

                    Latest updates across your projects

                </p>

            </div>


            {activities.length ===
            0 ? (

                <div className="
                    px-6
                    py-12
                    text-center
                ">

                    <Activity
                        size={32}
                        className="
                            mx-auto
                            text-slate-300
                        "
                    />


                    <p className="
                        mt-3
                        text-sm
                        text-slate-500
                    ">

                        No activity yet.

                    </p>

                </div>

            ) : (

                <div>

                    {activities.map(
                        (activity) => (

                            <div
                                key={
                                    activity._id
                                }
                                className="
                                    flex
                                    gap-3
                                    border-b
                                    border-slate-100
                                    px-6
                                    py-4
                                    last:border-b-0
                                "
                            >

                                <div className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-indigo-100
                                    text-xs
                                    font-bold
                                    text-indigo-700
                                ">

                                    {
                                        activity.user
                                            ?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                        "U"
                                    }

                                </div>


                                <div className="
                                    min-w-0
                                    flex-1
                                ">

                                    <p className="
                                        text-sm
                                        text-slate-700
                                    ">

                                        <span className="
                                            font-semibold
                                            text-slate-900
                                        ">

                                            {
                                                activity.user
                                                    ?.name ||
                                                "User"
                                            }

                                        </span>

                                        {" "}

                                        {
                                            activity.message
                                        }

                                    </p>


                                    <div className="
                                        mt-1
                                        flex
                                        flex-wrap
                                        gap-2
                                        text-xs
                                        text-slate-400
                                    ">

                                        {
                                            activity.project
                                                ?.name &&
                                            (
                                                <span>

                                                    {
                                                        activity.project.name
                                                    }

                                                </span>
                                            )
                                        }


                                        {
                                            activity.task
                                                ?.title &&
                                            (
                                                <>
                                                    <span>
                                                        •
                                                    </span>

                                                    <span className="
                                                        truncate
                                                    ">

                                                        {
                                                            activity.task.title
                                                        }

                                                    </span>
                                                </>
                                            )
                                        }


                                        <span>
                                            •
                                        </span>


                                        <span>

                                            {
                                                formatTime(
                                                    activity.createdAt
                                                )
                                            }

                                        </span>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );
}