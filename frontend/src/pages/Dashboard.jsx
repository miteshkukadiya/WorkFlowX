import {
    CheckCircle2,
    Clock3,
    FolderKanban,
    ListTodo,
    ArrowUpRight
} from "lucide-react";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const Dashboard = () => {

    const stats = [
        {
            title: "Total Projects",
            value: "12",
            change: "+2 this month",
            icon: FolderKanban
        },
        {
            title: "My Tasks",
            value: "24",
            change: "8 due this week",
            icon: ListTodo
        },
        {
            title: "Completed",
            value: "68%",
            change: "+12% from last week",
            icon: CheckCircle2
        },
        {
            title: "Tracked Hours",
            value: "32.5h",
            change: "+4.2h this week",
            icon: Clock3
        }
    ];


    return (
        <div className="space-y-6 lg:space-y-8">

            {/* Header */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <p className="text-sm font-medium text-slate-500">
                        Saturday, August 29
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        Good afternoon, Mitesh 👋
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's what's happening across your workspace.
                    </p>

                </div>

                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:w-auto">
                    <FolderKanban size={17} />
                    New Project
                </button>

            </div>


            {/* Stats */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (
                        <Card
                            key={stat.title}
                            className="border-slate-200/80 p-5 shadow-sm transition-shadow hover:shadow-md"
                        >

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.title}
                                    </p>

                                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {stat.value}
                                    </p>

                                </div>

                                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                                    <Icon size={19} />
                                </div>

                            </div>

                            <p className="mt-3 text-xs font-medium text-emerald-600">
                                {stat.change}
                            </p>

                        </Card>
                    );

                })}

            </div>


            {/* Main Grid */}

            <div className="grid gap-6 lg:grid-cols-3">

                {/* Recent Projects */}

                <Card className="overflow-hidden border-slate-200/80 lg:col-span-2">

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">

                        <div>

                            <h2 className="font-semibold text-slate-900">
                                Recent Projects
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Your latest project activity
                            </p>

                        </div>

                        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                            View all
                        </button>

                    </div>


                    <div className="divide-y divide-slate-100">

                        {[
                            {
                                name: "E-commerce Platform",
                                tasks: "24 / 32 tasks",
                                status: "In Progress"
                            },
                            {
                                name: "Mobile Banking App",
                                tasks: "18 / 18 tasks",
                                status: "Completed"
                            },
                            {
                                name: "Marketing Website",
                                tasks: "12 / 25 tasks",
                                status: "In Progress"
                            }
                        ].map((project) => (

                            <div
                                key={project.name}
                                className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-slate-50 sm:flex-nowrap sm:gap-4 sm:p-5"
                            >

                                <div className="min-w-0">

                                    <div className="flex items-center gap-3">

                                        <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />

                                        <h3 className="truncate text-sm font-semibold text-slate-800">
                                            {project.name}
                                        </h3>

                                    </div>

                                    <p className="mt-1 pl-5 text-xs text-slate-400">
                                        {project.tasks}
                                    </p>

                                </div>


                                <Badge
                                    variant={
                                        project.status === "Completed"
                                            ? "success"
                                            : "info"
                                    }
                                >
                                    {project.status}
                                </Badge>

                            </div>

                        ))}

                    </div>

                </Card>


                {/* My Tasks */}

                <Card className="overflow-hidden border-slate-200/80">

                    <div className="border-b border-slate-100 p-5">

                        <h2 className="font-semibold text-slate-900">
                            My Tasks
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Tasks requiring your attention
                        </p>

                    </div>


                    <div className="space-y-1 p-3">

                        {[
                            {
                                title: "Implement authentication API",
                                priority: "High"
                            },
                            {
                                title: "Design dashboard components",
                                priority: "Medium"
                            },
                            {
                                title: "Fix mobile navigation",
                                priority: "Low"
                            }
                        ].map((task) => (

                            <div
                                key={task.title}
                                className="group rounded-xl p-3 transition-colors hover:bg-slate-50"
                            >

                                <div className="flex items-start gap-3">

                                    <div className="mt-1 h-4 w-4 rounded-full border-2 border-slate-300 group-hover:border-slate-900" />

                                    <div className="min-w-0">

                                        <p className="text-sm font-medium text-slate-700">
                                            {task.title}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {task.priority} priority
                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>


                    <div className="border-t border-slate-100 p-4">

                        <button className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                            View all tasks
                            <ArrowUpRight size={15} />
                        </button>

                    </div>

                </Card>

            </div>

        </div>
    );
};

export default Dashboard;