import {
    useSortable
} from "@dnd-kit/sortable";

import {
    CSS
} from "@dnd-kit/utilities";

import {
    CalendarDays,
    Clock3,
    GripVertical
} from "lucide-react";


const priorityStyles = {

    low:
        "bg-slate-100 text-slate-600",

    medium:
        "bg-blue-50 text-blue-700",

    high:
        "bg-orange-50 text-orange-700",

    urgent:
        "bg-rose-50 text-rose-700"

};


const formatDate = (date) => {

    if (!date) {
        return "No deadline";
    }

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short"
            }
        );
};


export default function KanbanTaskCard({
    task
}) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task._id,
        data: {
            type: "task",
            task
        }
    });


    const style = {

        transform:
            CSS.Transform.toString(
                transform
            ),

        transition,

        opacity:
            isDragging ? 0.5 : 1

    };


    return (

        <div
            ref={setNodeRef}
            style={style}
            className="
                rounded-xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                transition-shadow
                hover:shadow-md
            "
        >

            <div className="flex items-start justify-between gap-2">

                <span
                    className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-[11px]
                        font-semibold
                        capitalize
                        ${priorityStyles[task.priority]}
                    `}
                >
                    {task.priority}
                </span>


                <button
                    {...attributes}
                    {...listeners}
                    className="
                        cursor-grab
                        rounded-lg
                        p-1.5
                        text-slate-400
                        hover:bg-slate-100
                        active:cursor-grabbing
                    "
                    aria-label={`Drag ${task.title}`}
                >
                    <GripVertical size={17} />
                </button>

            </div>


            <h3 className="mt-3 font-semibold text-slate-900">

                {task.title}

            </h3>


            {task.description && (

                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">

                    {task.description}

                </p>

            )}


            <div className="mt-4 flex items-center justify-between">

                <div className="flex items-center gap-1.5 text-xs text-slate-500">

                    <CalendarDays size={14} />

                    {formatDate(task.dueDate)}

                </div>


                <div className="flex items-center gap-1 text-xs text-slate-500">

                    <Clock3 size={14} />

                    {task.estimatedHours || 0}h

                </div>

            </div>


            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                <span className="max-w-[160px] truncate text-xs text-slate-500">

                    {task.project?.name}

                </span>


                <div
                    title={
                        task.assignedTo?.name ||
                        "Unassigned"
                    }
                    className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-100
                        text-xs
                        font-bold
                        text-indigo-700
                    "
                >

                    {task.assignedTo?.name
                        ?.charAt(0)
                        .toUpperCase() || "?"}

                </div>

            </div>

        </div>

    );
}