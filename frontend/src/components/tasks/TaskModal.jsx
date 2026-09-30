import { useEffect, useState } from "react";

import { X } from "lucide-react";

const initialForm = {
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    estimatedHours: 0
};

const toDateInput = (date) => {

    if (!date) return "";

    return new Date(date)
        .toISOString()
        .slice(0, 10);
};

export default function TaskModal({
    isOpen,
    onClose,
    onSubmit,
    task,
    projects,
    saving
}) {

    const [form, setForm] = useState(initialForm);

    const [error, setError] = useState("");

    useEffect(() => {

        if (task) {

            setForm({
                title: task.title || "",
                description: task.description || "",
                projectId: task.project?._id || "",
                assignedTo: task.assignedTo?._id || "",
                status: task.status || "todo",
                priority: task.priority || "medium",
                dueDate: toDateInput(task.dueDate),
                estimatedHours: task.estimatedHours || 0
            });

        } else {

            setForm(initialForm);

        }

        setError("");

    }, [task, isOpen]);

    if (!isOpen) return null;

    const selectedProject = projects.find(
        (project) => project._id === form.projectId
    );

    const availableMembers = selectedProject
        ? [
            selectedProject.owner,
            ...(selectedProject.members || [])
        ]
        : [];

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm((previous) => ({

            ...previous,

            [name]: value,

            ...(name === "projectId"
                ? { assignedTo: "" }
                : {})

        }));

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!form.title.trim()) {

            setError("Task title is required");

            return;

        }

        if (!form.projectId) {

            setError("Please select a project");

            return;

        }

        setError("");

        try {

            const payload = {

                title: form.title,

                description: form.description,

                status: form.status,

                priority: form.priority,

                dueDate: form.dueDate || null,

                estimatedHours: Number(
                    form.estimatedHours
                ),

                assignedTo: form.assignedTo || null

            };

            if (!task) {

                payload.projectId = form.projectId;

            }

            await onSubmit(payload);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save task"
            );

        }

    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">

                            {task
                                ? "Edit Task"
                                : "Create New Task"}

                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Organize and assign work.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >

                    {error && (

                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>

                    )}

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Task Title
                        </label>

                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                            maxLength={150}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe this task"
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Project
                        </label>

                        <select
                            name="projectId"
                            value={form.projectId}
                            onChange={handleChange}
                            disabled={Boolean(task)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
                        >

                            <option value="">
                                Select Project
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

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Assign To
                        </label>

                        <select
                            name="assignedTo"
                            value={form.assignedTo}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        >

                            <option value="">
                                Unassigned
                            </option>

                            {availableMembers.map((member) => (

                                <option
                                    key={member._id}
                                    value={member._id}
                                >
                                    {member.name}
                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
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

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Priority
                            </label>

                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            >

                                <option value="low">
                                    Low
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="high">
                                    High
                                </option>

                                <option value="urgent">
                                    Urgent
                                </option>

                            </select>

                        </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Due Date
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={form.dueDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Estimated Hours
                            </label>

                            <input
                                type="number"
                                name="estimatedHours"
                                min="0"
                                step="0.5"
                                value={form.estimatedHours}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            />

                        </div>

                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >

                            {saving
                                ? "Saving..."
                                : task
                                    ? "Save Changes"
                                    : "Create Task"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}