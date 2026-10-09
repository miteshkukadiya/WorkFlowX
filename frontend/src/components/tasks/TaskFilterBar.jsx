import { Search, RotateCcw } from "lucide-react";

export default function TaskFilterBar({
    filters,
    setFilters,
    projects = [],
    onReset
}) {
    const update = (key, value) => {
        setFilters(previous => ({
            ...previous,
            [key]: value,
            page: 1
        }));
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative md:col-span-2">
                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                        value={filters.search}
                        onChange={event =>
                            update("search", event.target.value)
                        }
                        placeholder="Search task title or description..."
                        className={`${inputClass} pl-10`}
                    />
                </div>

                <select
                    value={filters.projectId}
                    onChange={event =>
                        update("projectId", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">All Projects</option>

                    {projects.map(project => (
                        <option
                            key={project._id}
                            value={project._id}
                        >
                            {project.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={event =>
                        update("status", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="all">All Statuses</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={event =>
                        update("priority", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>

                <select
                    value={filters.assignee}
                    onChange={event =>
                        update("assignee", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="all">All Assignees</option>
                    <option value="me">Assigned to Me</option>
                    <option value="unassigned">Unassigned</option>
                </select>

                <select
                    value={filters.due}
                    onChange={event =>
                        update("due", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="all">Any Due Date</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due Today</option>
                    <option value="week">Next 7 Days</option>
                </select>

                <div className="flex gap-2">
                    <select
                        value={filters.sort}
                        onChange={event =>
                            update("sort", event.target.value)
                        }
                        className={inputClass}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="dueSoon">Due Date</option>
                    </select>

                    <button
                        onClick={onReset}
                        title="Reset filters"
                        className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"
                    >
                        <RotateCcw size={17} />
                    </button>
                </div>
            </div>
        </div>
    );
}