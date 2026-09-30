import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Plus,
    Search,
    ListTodo,
    Clock3,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { taskService } from "../services/taskService";

import { projectService } from "../services/projectService";

import TaskCard from "../components/tasks/TaskCard";

import TaskModal from "../components/tasks/TaskModal";


export default function Tasks() {

    const { user } = useAuth();

    const [tasks, setTasks] = useState([]);

    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const [projectFilter, setProjectFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);

    const [editingTask, setEditingTask] = useState(null);


    // LOAD DATA

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                tasksData,
                projectsData
            ] = await Promise.all([

                taskService.getAll(),

                projectService.getAll()

            ]);

            setTasks(tasksData);

            setProjects(projectsData);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load tasks"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // SAVE TASK

    const handleSubmit = async (data) => {

        setSaving(true);

        try {

            if (editingTask) {

                await taskService.update(
                    editingTask._id,
                    data
                );

            } else {

                await taskService.create(data);

            }

            setModalOpen(false);

            setEditingTask(null);

            await loadData();

        } finally {

            setSaving(false);

        }

    };


    // DELETE TASK

    const handleDelete = async (task) => {

        const confirmed = window.confirm(
            `Delete task "${task.title}"?`
        );

        if (!confirmed) return;

        try {

            await taskService.delete(task._id);

            setTasks((previous) =>
                previous.filter(
                    (item) => item._id !== task._id
                )
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to delete task"
            );

        }

    };


    // UPDATE STATUS

    const handleStatusChange = async (
        task,
        newStatus
    ) => {

        try {

            await taskService.update(
                task._id,
                {
                    status: newStatus
                }
            );

            setTasks((previous) =>
                previous.map((item) =>
                    item._id === task._id
                        ? {
                            ...item,
                            status: newStatus
                        }
                        : item
                )
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to update task status"
            );

        }

    };


    // FILTER TASKS

    const filteredTasks = useMemo(() => {

        return tasks.filter((task) => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                (task.description || "")
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                task.status === statusFilter;

            const matchesProject =
                projectFilter === "all" ||
                task.project?._id === projectFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesProject
            );

        });

    }, [
        tasks,
        search,
        statusFilter,
        projectFilter
    ]);


    // STATISTICS

    const stats = [

        {
            title: "Total Tasks",
            value: tasks.length,
            icon: ListTodo,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },

        {
            title: "To Do",
            value: tasks.filter(
                (task) => task.status === "todo"
            ).length,
            icon: AlertCircle,
            color: "text-slate-600",
            bg: "bg-slate-100"
        },

        {
            title: "In Progress",
            value: tasks.filter(
                (task) => task.status === "in-progress"
            ).length,
            icon: Clock3,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },

        {
            title: "Completed",
            value: tasks.filter(
                (task) => task.status === "done"
            ).length,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }

    ];


    const currentUserId = String(
        user?._id || user?.id
    );

    const ownedProjects = projects.filter(
        (project) =>
            String(project.owner?._id || project.owner) ===
            currentUserId
    );


    return (

        <div className="space-y-8">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Task Management
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Organize tasks, track progress and manage deadlines.
                    </p>

                </div>

                {ownedProjects.length > 0 && (

                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >

                        <Plus size={18} />

                        New Task

                    </button>

                )}

            </div>


            {/* STATISTICS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (

                        <div
                            key={stat.title}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >

                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                            >

                                <Icon size={21} />

                            </div>

                            <h2 className="mt-5 text-3xl font-bold text-slate-900">
                                {stat.value}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {stat.title}
                            </p>

                        </div>

                    );

                })}

            </div>


            {/* FILTERS */}

            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search tasks..."
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >

                    <option value="all">
                        All Status
                    </option>

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

                <select
                    value={projectFilter}
                    onChange={(event) =>
                        setProjectFilter(event.target.value)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >

                    <option value="all">
                        All Projects
                    </option>

                    {projects.map((project) => (

                        <option
                            key={project._id}
                            value={project._id}
                        >
                            {project.name}
                        </option>

                    ))}

                </select>

            </div>


            {/* ERROR */}

            {error && (

                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>

            )}


            {/* TASK CARDS */}

            {loading ? (

                <div className="py-20 text-center text-slate-500">
                    Loading tasks...
                </div>

            ) : filteredTasks.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">

                    <ListTodo
                        size={42}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 text-lg font-semibold">
                        No tasks found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Create a task or adjust your filters.
                    </p>

                </div>

            ) : (

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {filteredTasks.map((task) => {

                        const project = projects.find(
                            (item) =>
                                item._id === task.project?._id
                        );

                        const canManage =
                            String(
                                project?.owner?._id ||
                                project?.owner
                            ) === currentUserId;

                        const isAssignee =
                            String(task.assignedTo?._id) ===
                            currentUserId;

                        return (

                            <TaskCard
                                key={task._id}
                                task={task}
                                canManage={canManage}
                                canChangeStatus={
                                    canManage || isAssignee
                                }
                                onEdit={(selected) => {
                                    setEditingTask(selected);
                                    setModalOpen(true);
                                }}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                            />

                        );

                    })}

                </div>

            )}


            {/* MODAL */}

            <TaskModal
                isOpen={modalOpen}
                task={editingTask}
                projects={ownedProjects}
                saving={saving}
                onClose={() => {
                    setModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={handleSubmit}
            />

        </div>

    );

}