import { useEffect, useMemo, useState } from "react";

import {
    FolderKanban,
    Plus,
    Search,
    Activity,
    CheckCircle2,
    Clock3
} from "lucide-react";

import { projectService } from "../services/projectService";

import { useAuth } from "../context/AuthContext";

import ProjectCard from "../components/projects/ProjectCard";

import ProjectModal from "../components/projects/ProjectModal";


export default function Projects() {

    const { user } = useAuth();

    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);

    const [editingProject, setEditingProject] = useState(null);


    // FETCH PROJECTS

    const fetchProjects = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await projectService.getAll();

            setProjects(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load projects"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchProjects();
    }, []);


    // CREATE / UPDATE PROJECT

    const handleSubmit = async (data) => {

        setSaving(true);

        try {

            if (editingProject) {

                await projectService.update(
                    editingProject._id,
                    data
                );

            } else {

                await projectService.create(data);

            }

            setModalOpen(false);
            setEditingProject(null);

            await fetchProjects();

        } finally {

            setSaving(false);

        }
    };


    // DELETE PROJECT

    const handleDelete = async (project) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${project.name}"?`
        );

        if (!confirmed) return;

        try {

            await projectService.delete(project._id);

            setProjects((previous) =>
                previous.filter(
                    (item) => item._id !== project._id
                )
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to delete project"
            );

        }
    };


    // SEARCH AND FILTER

    const filteredProjects = useMemo(() => {

        return projects.filter((project) => {

            const matchesSearch =
                project.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                (project.description || "")
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                filter === "all" ||
                project.status === filter;

            return matchesSearch && matchesStatus;

        });

    }, [projects, search, filter]);


    // STATISTICS

    const stats = [
        {
            title: "Total Projects",
            value: projects.length,
            icon: FolderKanban,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            title: "Active Projects",
            value: projects.filter(
                (p) => p.status === "active"
            ).length,
            icon: Activity,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Completed",
            value: projects.filter(
                (p) => p.status === "completed"
            ).length,
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "On Hold",
            value: projects.filter(
                (p) => p.status === "on-hold"
            ).length,
            icon: Clock3,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ];


    return (
        <div className="space-y-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Projects
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage and track all your projects in one place.
                    </p>

                </div>

                <button
                    onClick={() => {
                        setEditingProject(null);
                        setModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    New Project
                </button>

            </div>


            {/* STATISTICS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >

                            <div className="flex items-center justify-between">

                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                                >
                                    <Icon size={21} />
                                </div>

                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-900">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {stat.title}
                            </p>

                        </div>
                    );
                })}

            </div>


            {/* SEARCH AND FILTER */}

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">

                <div className="relative flex-1">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search projects..."
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                    />

                </div>

                <select
                    value={filter}
                    onChange={(event) =>
                        setFilter(event.target.value)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                </select>

            </div>


            {/* ERROR */}

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}


            {/* PROJECT LIST */}

            {loading ? (

                <div className="py-20 text-center text-slate-500">
                    Loading projects...
                </div>

            ) : filteredProjects.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

                    <FolderKanban
                        size={42}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No projects found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Create a project or adjust your filters.
                    </p>

                </div>

            ) : (

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {filteredProjects.map((project) => (

                        <ProjectCard
                            key={project._id}
                            project={project}
                            canManage={
                                String(project.owner?._id || project.owner) ===
                                String(user?._id || user?.id)
                            }
                            onEdit={(selected) => {
                                setEditingProject(selected);
                                setModalOpen(true);
                            }}
                            onDelete={handleDelete}
                        />

                    ))}

                </div>

            )}


            {/* MODAL */}

            <ProjectModal
                isOpen={modalOpen}
                project={editingProject}
                saving={saving}
                onClose={() => {
                    setModalOpen(false);
                    setEditingProject(null);
                }}
                onSubmit={handleSubmit}
            />

        </div>
    );
}