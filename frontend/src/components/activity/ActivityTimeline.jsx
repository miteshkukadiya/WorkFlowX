import {
    Activity,
    Circle
} from "lucide-react";


const formatTime = (
    date
) => {

    const value =
        new Date(date);

    const now =
        new Date();

    const difference =
        Math.floor(
            (
                now - value
            ) / 1000
        );


    if (difference < 60) {
        return "Just now";
    }


    if (difference < 3600) {

        return `${Math.floor(
            difference / 60
        )}m ago`;

    }


    if (difference < 86400) {

        return `${Math.floor(
            difference / 3600
        )}h ago`;

    }


    return value.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

};


export default function ActivityTimeline({
    activities
}) {

    return (

        <section className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
        ">

            <div className="
                flex
                items-center
                gap-3
                border-b
                border-slate-100
                px-6
                py-5
            ">

                <Activity
                    size={20}
                    className="text-indigo-600"
                />

                <div>

                    <h2 className="
                        font-semibold
                        text-slate-900
                    ">

                        Activity

                    </h2>

                    <p className="
                        text-xs
                        text-slate-500
                    ">

                        Task history

                    </p>

                </div>

            </div>


            <div className="p-6">

                {activities.length === 0 ? (

                    <p className="
                        py-8
                        text-center
                        text-sm
                        text-slate-500
                    ">

                        No activity yet.

                    </p>

                ) : (

                    <div>

                        {activities.map(
                            (
                                activity,
                                index
                            ) => (

                                <div
                                    key={
                                        activity._id
                                    }
                                    className="
                                        relative
                                        flex
                                        gap-4
                                        pb-6
                                        last:pb-0
                                    "
                                >

                                    {index !==
                                        activities.length -
                                            1 && (

                                        <div className="
                                            absolute
                                            left-[7px]
                                            top-4
                                            h-full
                                            w-px
                                            bg-slate-200
                                        " />

                                    )}


                                    <Circle
                                        size={15}
                                        className="
                                            relative
                                            z-10
                                            mt-1
                                            shrink-0
                                            fill-indigo-100
                                            text-indigo-500
                                        "
                                    />


                                    <div className="
                                        min-w-0
                                    ">

                                        <p className="
                                            text-sm
                                            leading-5
                                            text-slate-600
                                        ">

                                            <span className="
                                                font-semibold
                                                text-slate-900
                                            ">

                                                {activity.user
                                                    ?.name ||
                                                    "User"}

                                            </span>

                                            {" "}

                                            {activity.message}

                                        </p>


                                        <p className="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        ">

                                            {formatTime(
                                                activity.createdAt
                                            )}

                                        </p>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </section>

    );
}