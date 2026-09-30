import {
    CalendarDays,
    Clock3,
    Pencil,
    Trash2,
    FolderKanban
} from "lucide-react";

const priorityStyles = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-blue-50 text-blue-700",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-rose-50 text-rose-700"
};

const statusStyles = {
    todo: "bg-slate-100 text-slate-600",
    "in-progress": "bg-indigo-50 text-indigo-700",
    done: "bg-emerald-50 text-emerald-700"
};

const formatDate = (date) => {

    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
};

export default function TaskCard({
    task,
    onEdit,
    onDelete,
    onStatusChange,
    canManage,
    canChangeStatus
}) {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        priorityStyles[task.priority]
                    }`}
                >
                    {task.priority}
                </span>

                {canManage && (

                    <div className="flex gap-2">

                        <button
                            onClick={() => onEdit(task)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            <Pencil size={16} />
                        </button>

                        <button
                            onClick={() => onDelete(task)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                )}

            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {task.title}
            </h3>

            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                {task.description || "No description provided."}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                <FolderKanban size={16} />

                <span className="truncate">
                    {task.project?.name || "Unknown Project"}
                </span>

            </div>

            <div className="mt-4 flex flex-wrap gap-3">

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[task.status]
                    }`}
                >
                    {task.status}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-500">

                    <Clock3 size={14} />

                    {task.estimatedHours || 0} hours

                </span>

            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">

                <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2 text-xs text-slate-500">

                        <CalendarDays size={15} />

                        {formatDate(task.dueDate)}

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">

                        {task.assignedTo?.name
                            ?.charAt(0)
                            .toUpperCase() || "?"}

                    </div>

                </div>

                {canChangeStatus && (

                    <select
                        value={task.status}
                        onChange={(event) =>
                            onStatusChange(
                                task,
                                event.target.value
                            )
                        }
                        className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="todo">
                            To Do
                        </option>

                        <option value="in-progress">
                            In Progress
                        </option>

                        <option value="done">
                            Done
                        </option>
                    </select>

                )}

            </div>

        </div>

    );
}