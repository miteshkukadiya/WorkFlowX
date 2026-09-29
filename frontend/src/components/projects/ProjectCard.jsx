import {
    CalendarDays,
    FolderKanban,
    MoreHorizontal,
    Pencil,
    Trash2
} from "lucide-react";

const statusStyles = {
    planning: "bg-slate-100 text-slate-600",
    active: "bg-emerald-50 text-emerald-700",
    "on-hold": "bg-amber-50 text-amber-700",
    completed: "bg-indigo-50 text-indigo-700"
};

const priorityStyles = {
    low: "text-slate-500",
    medium: "text-amber-600",
    high: "text-rose-600"
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

export default function ProjectCard({
    project,
    onEdit,
    onDelete,
    canManage
}) {

    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

                <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                        backgroundColor: `${project.color}18`,
                        color: project.color
                    }}
                >
                    <FolderKanban size={23} />
                </div>

                {canManage && (
                    <div className="flex gap-2">

                        <button
                            onClick={() => onEdit(project)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                            title="Edit project"
                        >
                            <Pencil size={16} />
                        </button>

                        <button
                            onClick={() => onDelete(project)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete project"
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>
                )}

            </div>

            <h3 className="mt-5 line-clamp-1 text-lg font-semibold text-slate-900">
                {project.name}
            </h3>

            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                {project.description || "No description provided."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[project.status]
                    }`}
                >
                    {project.status}
                </span>

                <span
                    className={`text-xs font-semibold capitalize ${
                        priorityStyles[project.priority]
                    }`}
                >
                    {project.priority} priority
                </span>

            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">

                <div className="flex items-center justify-between gap-2 text-sm text-slate-500">

                    <div className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        <span>
                            {formatDate(project.endDate)}
                        </span>
                    </div>

                    <span className="text-xs">
                        {project.members?.length || 0} members
                    </span>

                </div>

            </div>

        </div>
    );
}