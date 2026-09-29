import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    endDate: "",
    color: "#6366f1"
};

const colors = [
    "#6366f1",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#f43f5e",
    "#8b5cf6"
];

const toDateInput = (date) => {
    if (!date) return "";

    return new Date(date)
        .toISOString()
        .slice(0, 10);
};

export default function ProjectModal({
    isOpen,
    onClose,
    onSubmit,
    project,
    saving
}) {

    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");

    useEffect(() => {

        if (project) {
            setForm({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "planning",
                priority: project.priority || "medium",
                startDate: toDateInput(project.startDate),
                endDate: toDateInput(project.endDate),
                color: project.color || "#6366f1"
            });
        } else {
            setForm(initialForm);
        }

        setError("");

    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!form.name.trim()) {
            setError("Project name is required");
            return;
        }

        if (
            form.startDate &&
            form.endDate &&
            form.endDate < form.startDate
        ) {
            setError("End date cannot be before start date");
            return;
        }

        setError("");

        try {
            await onSubmit({
                ...form,
                startDate: form.startDate || null,
                endDate: form.endDate || null
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save project"
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {project ? "Edit Project" : "Create Project"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Organize your team's work.
                        </p>
                    </div>

                    <button
                        type="button"
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
                            Project Name
                        </label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                            maxLength={100}
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
                            placeholder="What is this project about?"
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        />
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
                                <option value="planning">Planning</option>
                                <option value="active">Active</option>
                                <option value="on-hold">On Hold</option>
                                <option value="completed">Completed</option>
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
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                End Date
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="mb-3 block text-sm font-medium">
                            Project Color
                        </label>

                        <div className="flex flex-wrap gap-3">

                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() =>
                                        setForm((previous) => ({
                                            ...previous,
                                            color
                                        }))
                                    }
                                    className={`h-9 w-9 rounded-full ${
                                        form.color === color
                                            ? "ring-2 ring-slate-800 ring-offset-2"
                                            : ""
                                    }`}
                                    style={{
                                        backgroundColor: color
                                    }}
                                />
                            ))}

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
                                : project
                                    ? "Save Changes"
                                    : "Create Project"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}