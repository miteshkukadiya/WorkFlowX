import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListTodo, RefreshCw } from "lucide-react";

import { taskSearchService } from "../services/taskSearchService";
import { projectService } from "../services/projectService";

import TaskFilterBar from "../components/tasks/TaskFilterBar";
import { savedViewService } from "../services/savedViewService";

const defaultFilters = {
    search: "",
    projectId: "",
    status: "all",
    priority: "all",
    assignee: "all",
    due: "all",
    sort: "newest",
    page: 1,
    limit: 10
};

const formatDate = date =>
    date
        ? new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : "—";

export default function AllTasks() {
    const navigate = useNavigate();

    const [filters, setFilters] = useState(defaultFilters);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [savedViews, setSavedViews] = useState([]);

    const loadSavedViews = async () => {
        try {
            const data = await savedViewService.getAll();
            setSavedViews(data);
        } catch (error) {
            console.error("Saved views error:", error);
        }
    };

    useEffect(() => {
        loadSavedViews();
    }, []);

    const saveCurrentView = async () => {
        const name = window.prompt("Enter view name:");

        if (!name?.trim()) return;

        try {
            await savedViewService.create({
                name: name.trim(),
                filters
            });

            await loadSavedViews();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to save view"
            );
        }
    };

    const applySavedView = view => {
        setFilters({
            ...defaultFilters,
            ...view.filters,
            page: 1
        });
    };

    const removeSavedView = async id => {
        try {
            await savedViewService.delete(id);
            await loadSavedViews();
        } catch (error) {
            alert("Unable to delete saved view");
        }
    };

    useEffect(() => {
        let active = true;

        const loadProjects = async () => {
            try {
                const result = await projectService.getAll();

                if (active) {
                    setProjects(
                        Array.isArray(result)
                            ? result
                            : result?.projects || result?.data || []
                    );
                }
            } catch (error) {
                console.error("Unable to load projects:", error);
            }
        };

        loadProjects();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadTasks = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await taskSearchService.search(filters);

                if (!active) return;

                setTasks(data.tasks || []);
                setPagination(data.pagination);

            } catch (error) {
                if (active) {
                    setError(
                        error.response?.data?.message ||
                        "Unable to load tasks"
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        // Debounce search requests
        const timeout = setTimeout(loadTasks, 350);

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [filters, refreshKey]);

    const resetFilters = () => {
        setFilters({ ...defaultFilters });
    };

    const changePage = page => {
        setFilters(previous => ({
            ...previous,
            page
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        All Tasks
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Search and manage tasks across your projects.
                    </p>
                </div>

                <button
                    onClick={() => setRefreshKey(value => value + 1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={saveCurrentView}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
                + Save Current View
            </button>

            {savedViews.map(view => (
                <div
                    key={view._id}
                    className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <button
                        onClick={() => applySavedView(view)}
                        className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        {view.name}
                    </button>

                    <button
                        onClick={() => removeSavedView(view._id)}
                        aria-label={`Delete ${view.name}`}
                        className="border-l px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>


            <TaskFilterBar
                filters={filters}
                setFilters={setFilters}
                projects={projects}
                onReset={resetFilters}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="font-semibold text-slate-900">
                        Task Results
                    </h2>

                    <span className="text-sm text-slate-500">
                        {pagination.total} tasks
                    </span>
                </div>

                {error && (
                    <div className="p-5 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        Loading tasks...
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <ListTodo
                            size={34}
                            className="text-slate-300"
                        />

                        <p className="mt-3 font-medium text-slate-700">
                            No matching tasks
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Task</th>
                                    <th className="px-5 py-3">Project</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Priority</th>
                                    <th className="px-5 py-3">Assignee</th>
                                    <th className="px-5 py-3">Due Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {tasks.map(task => (
                                    <tr
                                        key={task._id}
                                        onClick={() =>
                                            navigate(`/tasks/${task._id}`)
                                        }
                                        className="cursor-pointer transition hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800">
                                                {task.title}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {task.project?.name || "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm capitalize">
                                            {task.status?.replace("-", " ")}
                                        </td>

                                        <td className="px-5 py-4 text-sm capitalize">
                                            {task.priority}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {task.assignedTo?.name || "Unassigned"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatDate(task.dueDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                    <p className="text-sm text-slate-500">
                        Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                    </p>

                    <div className="flex gap-2">
                        <button
                            disabled={filters.page <= 1 || loading}
                            onClick={() => changePage(filters.page - 1)}
                            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            disabled={
                                filters.page >= pagination.totalPages ||
                                loading
                            }
                            onClick={() => changePage(filters.page + 1)}
                            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}