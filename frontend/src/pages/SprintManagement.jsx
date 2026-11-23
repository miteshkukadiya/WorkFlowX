import { useEffect, useState } from "react";
import { CalendarRange, CheckCircle2, CircleDot, Plus, Rocket, Trash2 } from "lucide-react";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { sprintService } from "../services/sprintService";

const statusClass = {
    planned: "bg-slate-100 text-slate-600",
    active: "bg-emerald-50 text-emerald-700",
    completed: "bg-blue-50 text-blue-700"
};

export default function SprintManagement() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [sprints, setSprints] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [form, setForm] = useState({ name: "", goal: "", startDate: "", endDate: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async selectedProject => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const [sprintData, backlogData] = await Promise.all([
                sprintService.getAll(selectedProject),
                taskService.getAll({ projectId: selectedProject, backlog: true })
            ]);
            setSprints(sprintData);
            setBacklog(backlogData);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load sprint data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        projectService.getAll()
            .then(data => {
                setProjects(data);
                if (data[0]?._id) {
                    setProjectId(data[0]._id);
                    load(data[0]._id);
                } else setLoading(false);
            })
            .catch(() => {
                setError("Unable to load projects");
                setLoading(false);
            });
    }, []);

    const create = async event => {
        event.preventDefault();
        if (!form.name.trim()) return;
        try {
            await sprintService.create({ ...form, projectId });
            setForm({ name: "", goal: "", startDate: "", endDate: "" });
            await load(projectId);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to create sprint");
        }
    };

    const updateStatus = async (sprint, status) => {
        await sprintService.update(sprint._id, { status });
        await load(projectId);
    };

    const addToSprint = async (sprintId, taskId) => {
        await sprintService.addTask(sprintId, taskId);
        await load(projectId);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Planning</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sprints & backlog</h1>
                    <p className="mt-2 text-slate-500">Plan upcoming work, run focused sprints, and keep unplanned tasks in the backlog.</p>
                </div>
                <select value={projectId} onChange={event => { setProjectId(event.target.value); load(event.target.value); }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                    {projects.map(project => <option key={project._id} value={project._id}>{project.name}</option>)}
                </select>
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <section className="space-y-4">
                    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading planning data...</div> : sprints.map(sprint => (
                        <article key={sprint._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2"><h2 className="text-lg font-bold text-slate-900">{sprint.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[sprint.status]}`}>{sprint.status}</span></div>
                                    <p className="mt-2 text-sm text-slate-500">{sprint.goal || "No sprint goal added."}</p>
                                    <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><CalendarRange size={14} /> {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "No start"} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "No end"} · {sprint.taskCount} tasks</p>
                                </div>
                                <div className="flex gap-2">
                                    {sprint.status === "planned" && <button onClick={() => updateStatus(sprint, "active")} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><Rocket size={14} /> Start</button>}
                                    {sprint.status === "active" && <button onClick={() => updateStatus(sprint, "completed")} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><CheckCircle2 size={14} /> Complete</button>}
                                </div>
                            </div>
                            {backlog.length > 0 && <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Add from backlog</p><div className="flex flex-wrap gap-2">{backlog.map(task => <button key={task._id} onClick={() => addToSprint(sprint._id, task._id)} className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"><Plus size={12} className="mr-1 inline" />{task.title}</button>)}</div></div>}
                        </article>
                    ))}
                    {!loading && sprints.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No sprints yet. Create your first sprint.</div>}
                </section>

                <aside className="space-y-6">
                    <form onSubmit={create} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-bold text-slate-900"><CircleDot size={18} className="text-indigo-600" /> Create sprint</h2>
                        <div className="mt-4 space-y-3">
                            <input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Sprint name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            <textarea value={form.goal} onChange={event => setForm({ ...form, goal: event.target.value })} placeholder="Sprint goal" rows={3} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            <div className="grid grid-cols-2 gap-2"><input type="date" value={form.startDate} onChange={event => setForm({ ...form, startDate: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" /><input type="date" value={form.endDate} onChange={event => setForm({ ...form, endDate: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" /></div>
                            <button disabled={!projectId} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} /> Create sprint</button>
                        </div>
                    </form>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-bold text-slate-900"><Trash2 size={18} className="text-amber-600" /> Backlog <span className="ml-auto rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">{backlog.length}</span></h2>
                        <div className="mt-4 space-y-2">{backlog.length ? backlog.map(task => <div key={task._id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{task.title}<p className="mt-1 text-xs text-slate-400">{task.priority} priority</p></div>) : <p className="text-sm text-slate-500">Backlog is clear.</p>}</div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
