import {
    CalendarDays,
    ChevronRight
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";


const formatDate = (
    date
) => {

    if (!date) {
        return "No due date";
    }


    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );

};


export default function DueSoonTasks({
    tasks = []
}) {

    const navigate =
        useNavigate();


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

                    Tasks Due Soon

                </h2>


                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">

                    Your upcoming deadlines

                </p>

            </div>


            {tasks.length === 0 ? (

                <div className="
                    px-6
                    py-12
                    text-center
                ">

                    <CalendarDays
                        size={32}
                        className="
                            mx-auto
                            text-slate-300
                        "
                    />


                    <p className="
                        mt-3
                        text-sm
                        font-medium
                        text-slate-600
                    ">

                        No upcoming deadlines

                    </p>


                    <p className="
                        mt-1
                        text-xs
                        text-slate-400
                    ">

                        You don't have tasks due in the next 7 days.

                    </p>

                </div>

            ) : (

                <div>

                    {tasks.map(
                        (task) => (

                            <button
                                key={
                                    task._id
                                }
                                onClick={() =>
                                    navigate(
                                        `/tasks/${task._id}`
                                    )
                                }
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-4
                                    border-b
                                    border-slate-100
                                    px-6
                                    py-4
                                    text-left
                                    transition
                                    last:border-b-0
                                    hover:bg-slate-50
                                "
                            >

                                <div className="
                                    min-w-0
                                    flex-1
                                ">

                                    <p className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                    ">

                                        {
                                            task.title
                                        }

                                    </p>


                                    <div className="
                                        mt-1
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                        text-xs
                                        text-slate-500
                                    ">

                                        <span>

                                            {
                                                task.project
                                                    ?.name ||
                                                "Project"
                                            }

                                        </span>


                                        <span>
                                            •
                                        </span>


                                        <span>

                                            Due{" "}

                                            {
                                                formatDate(
                                                    task.dueDate
                                                )
                                            }

                                        </span>

                                    </div>

                                </div>


                                <span className="
                                    rounded-full
                                    bg-indigo-50
                                    px-2.5
                                    py-1
                                    text-[11px]
                                    font-semibold
                                    capitalize
                                    text-indigo-600
                                ">

                                    {
                                        task.priority
                                    }

                                </span>


                                <ChevronRight
                                    size={17}
                                    className="
                                        shrink-0
                                        text-slate-300
                                    "
                                />

                            </button>

                        )
                    )}

                </div>

            )}

        </div>

    );
}