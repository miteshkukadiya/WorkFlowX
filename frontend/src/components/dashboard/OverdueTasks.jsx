import {
    AlertTriangle,
    ChevronRight
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";


export default function OverdueTasks({
    tasks = []
}) {

    const navigate =
        useNavigate();


    if (
        tasks.length === 0
    ) {

        return null;

    }


    return (

        <div className="
            overflow-hidden
            rounded-2xl
            border
            border-rose-100
            bg-white
            shadow-sm
        ">

            <div className="
                flex
                items-center
                gap-3
                border-b
                border-rose-100
                bg-rose-50
                px-6
                py-4
            ">

                <AlertTriangle
                    size={19}
                    className="
                        text-rose-600
                    "
                />


                <div>

                    <h2 className="
                        font-bold
                        text-slate-900
                    ">

                        Overdue Tasks

                    </h2>


                    <p className="
                        text-xs
                        text-rose-600
                    ">

                        {tasks.length}
                        {" "}
                        task
                        {tasks.length !== 1
                            ? "s"
                            : ""}
                        {" "}
                        need attention

                    </p>

                </div>

            </div>


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


                            <p className="
                                mt-1
                                text-xs
                                text-slate-500
                            ">

                                {
                                    task.project
                                        ?.name
                                }

                            </p>

                        </div>


                        <span className="
                            text-xs
                            font-semibold
                            text-rose-600
                        ">

                            {
                                new Date(
                                    task.dueDate
                                )
                                    .toLocaleDateString(
                                        "en-IN"
                                    )
                            }

                        </span>


                        <ChevronRight
                            size={17}
                            className="
                                text-slate-300
                            "
                        />

                    </button>

                )
            )}

        </div>

    );
}