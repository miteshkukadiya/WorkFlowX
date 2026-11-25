import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Download,
    GitBranch,
    Map,
    Printer,
    Save
} from "lucide-react";
import { projectService } from "../services/projectService";
import { planningService } from "../services/planningService";
import { formatDate } from "../utils/date";

const dateValue = value => value ? new Date(value) : null;
const dateLabel = value => value
    ? formatDate(value, "en-IN", { day: "2-digit", month: "short" })
    : "No date";
const isoDay = value => value.toISOString().slice(0, 10);

const downloadCsv = tasks => {
    const headers = ["Title", "Project", "Status", "Priority", "Assignee", "Due date", "Dependencies"];
    const rows = tasks.map(task => [
        task.title,
        task.project?.name || "",
        task.status,
        task.priority,
        task.assignedTo?.name || "",
        task.dueDate || "",
        (task.dependencies || []).map(dependency => dependency.title).join("; ")
    ]);
    const csv = [headers, ...rows]
        .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
        .join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "workflowx-planning-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
};

function CalendarView({ tasks }) {
    const [month, setMonth] = useState(() => {
        const value = new Date();
        return new Date(value.getFullYear(), value.getMonth(), 1);
    });
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Array.from({ length: firstDay + days }, (_, index) =>
        index < firstDay ? null : index - firstDay + 1
    );
    const tasksByDay = tasks.reduce((result, task) => {
        if (task.dueDate) {
            const key = task.dueDate.slice(0, 10);
            result[key] = [...(result[key] || []), task];
        }
        return result;
    }, {});

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                    {formatDate(month, "en-IN", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-2">
                    <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Previous</button>
                    <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500">{day}</div>)}
                {cells.map((day, index) => {
                    const key = day ? isoDay(new Date(month.getFullYear(), month.getMonth(), day)) : "";
                    return <div key={`${key}-${index}`} className="min-h-28 bg-white p-2">
                        {day && <><p className="text-xs font-semibold text-slate-500">{day}</p><div className="mt-1 space-y-1">
                            {(tasksByDay[key] || []).map(task => <p key={task._id} className="truncate rounded bg-indigo-50 px-1.5 py-1 text-xs text-indigo-700" title={task.title}>{task.title}</p>)}
                        </div></>}
                    </div>;
                })}
            </div>
        </div>
    );
}

function RoadmapView({ tasks }) {
    const datedTasks = tasks.filter(task => task.dueDate || task.createdAt);
    const start = datedTasks.reduce((date, task) => {
        const value = dateValue(task.createdAt) || new Date();
        return value < date ? value : date;
    }, new Date());
    const end = datedTasks.reduce((date, task) => {
        const value = dateValue(task.dueDate) || dateValue(task.createdAt) || new Date();
        return value > date ? value : date;
    }, new Date());
    const total = Math.max(1, end - start);

    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Timeline / Roadmap</h2>
        <div className="space-y-4">
            {datedTasks.map(task => {
                const taskStart = dateValue(task.createdAt) || start;
                const taskEnd = dateValue(task.dueDate) || taskStart;
                const left = Math.max(0, ((taskStart - start) / total) * 100);
                const width = Math.max(3, ((taskEnd - taskStart) / total) * 100);
                return <div key={task._id} className="grid grid-cols-[10rem_1fr] items-center gap-3">
                    <div className="truncate text-sm font-medium text-slate-700" title={task.title}>{task.title}</div>
                    <div className="relative h-8 rounded-lg bg-slate-100">
                        <div className={`absolute top-1 h-6 rounded-md ${task.status === "done" ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ left: `${left}%`, width: `${width}%` }} title={`${dateLabel(taskStart)} - ${dateLabel(task.dueDate)}`} />
                    </div>
                </div>;
            })}
            {!datedTasks.length && <p className="py-8 text-center text-sm text-slate-500">Add dates to tasks to see your roadmap.</p>}
        </div>
    </div>;
}

function DependenciesView({ tasks, onDependenciesUpdated }) {
    const [selectedId, setSelectedId] = useState(tasks[0]?._id || "");
    const [selectedDependencies, setSelectedDependencies] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const selectedTask = tasks.find(task => task._id === selectedId);

    const dependencyKey = (selectedTask?.dependencies || []).map(dependency => dependency._id).join(",");
    useEffect(() => {
        setSelectedDependencies(dependencyKey ? dependencyKey.split(",") : []);
    }, [selectedId, dependencyKey]);

    const persistDependencies = async (taskId, dependencyIds, successMessage) => {
        setSaving(true);
        setMessage("");
        try {
            const dependencies = await planningService.updateDependencies(taskId, dependencyIds);
            onDependenciesUpdated(taskId, dependencies);
            setMessage(successMessage);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to update dependencies.");
        } finally {
            setSaving(false);
        }
    };

    const save = () => persistDependencies(selectedId, selectedDependencies, "Dependencies saved.");
    const removeDependency = (task, dependencyId) => persistDependencies(
        task._id,
        task.dependencies
            .filter(dependency => dependency._id !== dependencyId)
            .map(dependency => dependency._id),
        "Dependency removed."
    );

    return <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Task dependencies</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a task, then select the tasks that must finish first.</p>
            {!tasks.length && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Create a task in this project before configuring dependencies.</p>}
            <select value={selectedId} onChange={event => setSelectedId(event.target.value)} disabled={!tasks.length} className="mt-5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50">
                {tasks.map(task => <option key={task._id} value={task._id}>{task.title}</option>)}
            </select>
            <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {tasks.filter(task => task._id !== selectedId).map(task => (
                    <label key={task._id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-indigo-50">
                        <input
                            type="checkbox"
                            checked={selectedDependencies.includes(task._id)}
                            onChange={event => setSelectedDependencies(current => event.target.checked
                                ? [...current, task._id]
                                : current.filter(id => id !== task._id))}
                            className="size-4 accent-indigo-600"
                        />
                        <span>{task.title}</span>
                    </label>
                ))}
                {tasks.length === 1 && <p className="p-3 text-sm text-slate-500">Add another task to create a dependency.</p>}
            </div>
            <button disabled={!selectedId || saving} onClick={save} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} />{saving ? "Saving..." : "Save dependencies"}</button>
            {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Dependency map</h2>
            <div className="mt-4 space-y-3">
                {tasks.filter(task => task.dependencies?.length).map(task => (
                    <div key={task._id} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Depends on</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {task.dependencies.map(dependency => (
                                <span key={dependency._id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                    {dependency.title}
                                    <button
                                        type="button"
                                        onClick={() => removeDependency(task, dependency._id)}
                                        disabled={saving}
                                        aria-label={`Remove ${dependency.title} dependency from ${task.title}`}
                                        className="font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                {!tasks.some(task => task.dependencies?.length) && <p className="py-8 text-center text-sm text-slate-500">No dependencies configured yet.</p>}
            </div>
        </div>
    </div>;
}

export default function Planning() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [tasks, setTasks] = useState([]);
    const [tab, setTab] = useState("calendar");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleDependenciesUpdated = (taskId, dependencies) => {
        setTasks(currentTasks => currentTasks.map(task =>
            task._id === taskId ? { ...task, dependencies } : task
        ));
    };

    useEffect(() => {
        projectService.getAll().then(data => {
            setProjects(data || []);
            if (data?.[0]?._id) setProjectId(data[0]._id);
        }).catch(() => setError("Unable to load projects."));
    }, []);

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        planningService.getTasks(projectId)
            .then(setTasks)
            .catch(error => setError(error.response?.data?.message || "Unable to load planning data."))
            .finally(() => setLoading(false));
    }, [projectId]);

    const tabs = useMemo(() => [
        ["calendar", CalendarDays, "Calendar"],
        ["roadmap", Map, "Timeline / Roadmap"],
        ["dependencies", GitBranch, "Dependencies"]
    ], []);

    return <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Planning workspace</h1><p className="mt-1 text-sm text-slate-500">Plan deadlines, visualize delivery and manage task dependencies.</p></div>
            <div className="flex flex-wrap gap-2">
                <select value={projectId} onChange={event => setProjectId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Select project</option>{projects.map(project => <option key={project._id} value={project._id}>{project.name}</option>)}</select>
                <button onClick={() => downloadCsv(tasks)} disabled={!tasks.length} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"><Download size={16} />CSV</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"><Printer size={16} />PDF</button>
            </div>
        </div>
        <div className="flex flex-wrap gap-2">{tabs.map(([value, Icon, label]) => <button key={value} onClick={() => setTab(value)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === value ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}><Icon size={16} />{label}</button>)}</div>
        {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-2xl border bg-white p-12 text-center text-sm text-slate-500">Loading planning data...</div> : !projectId ? <div className="rounded-2xl border bg-white p-12 text-center text-sm text-slate-500">Select a project to begin planning.</div> : tab === "calendar" ? <CalendarView tasks={tasks} /> : tab === "roadmap" ? <RoadmapView tasks={tasks} /> : <DependenciesView tasks={tasks} onDependenciesUpdated={handleDependenciesUpdated} />}
    </div>;
}
