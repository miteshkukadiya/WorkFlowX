import {
    CalendarDays,
    Clock3
} from "lucide-react";


export default function TaskDragPreview({
    task
}) {

    return (

        <div className="
            w-[300px]
            rotate-2
            rounded-xl
            border
            border-indigo-200
            bg-white
            p-4
            shadow-xl
        ">

            <span className="
                rounded-full
                bg-indigo-50
                px-2.5
                py-1
                text-xs
                font-semibold
                capitalize
                text-indigo-700
            ">

                {task.priority}

            </span>


            <h3 className="mt-3 font-semibold text-slate-900">

                {task.title}

            </h3>


            <div className="mt-4 flex justify-between text-xs text-slate-500">

                <span className="flex items-center gap-1">

                    <CalendarDays size={14} />

                    {task.dueDate
                        ? new Date(
                            task.dueDate
                        ).toLocaleDateString(
                            "en-IN"
                        )
                        : "No deadline"}

                </span>


                <span className="flex items-center gap-1">

                    <Clock3 size={14} />

                    {task.estimatedHours || 0}h

                </span>

            </div>

        </div>

    );
}