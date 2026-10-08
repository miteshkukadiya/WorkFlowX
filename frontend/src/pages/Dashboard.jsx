
import { useCallback, useEffect, useState } from "react";

import {
    CheckCircle2,
    Clock3,
    FolderKanban,
    ListTodo,
    RefreshCw
} from "lucide-react";

import { dashboardService } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";

import ReportStatCard from "../components/reports/ReportStatCard";
import WeeklyTimeChart from "../components/reports/WeeklyTimeChart";
import ProjectProgress from "../components/reports/ProjectProgress";

import TaskOverview from "../components/dashboard/TaskOverview";
import DueSoonTasks from "../components/dashboard/DueSoonTasks";
import OverdueTasks from "../components/dashboard/OverdueTasks";
import RecentActivity from "../components/dashboard/RecentActivity";

// FORMAT TRACKED TIME

const formatTime = (seconds = 0) => {
    const totalSeconds = Number(seconds) || 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
};

// DASHBOARD COMPONENT

export default function Dashboard() {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // FETCH DASHBOARD DATA

    const loadDashboard = useCallback(async (refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await dashboardService.getDashboard();

            setDashboard(data);
        } catch (err) {
            console.error("Dashboard loading error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load dashboard"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // LOAD DASHBOARD ON MOUNT

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // LOADING STATE

    if (loading) {
        return (
            <div className="flex min-h-125 items-center justify-center">
                <div className="text-center">
                    <div
                        className="
                            mx-auto
                            h-8
                            w-8
                            animate-spin
                            rounded-full
                            border-4
                            border-slate-200
                            border-t-indigo-600
                        "
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading your workspace...
                    </p>
                </div>
            </div>
        );
    }

    // ERROR STATE

    if (error && !dashboard) {
        return (
            <div
                className="
                    rounded-2xl
                    border
                    border-red-100
                    bg-red-50
                    p-6
                "
            >
                <p className="font-semibold text-red-700">
                    Dashboard failed to load
                </p>

                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => loadDashboard()}
                    className="
                        mt-4
                        rounded-lg
                        bg-red-600
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-red-700
                    "
                >
                    Try Again
                </button>
            </div>
        );
    }

    // DASHBOARD STATISTICS

    const stats = dashboard?.stats ?? {};

    return (
        <div className="space-y-6">

            {/* DASHBOARD HEADER */}

            <div
                className="
                    flex
                    flex-col
                    justify-between
                    gap-4
                    sm:flex-row
                    sm:items-center
                "
            >
                <div>
                    <p className="text-sm font-medium text-indigo-600">
                        Welcome back
                    </p>

                    <h1
                        className="
                            mt-1
                            text-2xl
                            font-bold
                            tracking-tight
                            text-slate-900
                            sm:text-3xl
                        "
                    >
                        {user?.name
                            ? `${user.name}'s Workspace`
                            : "Your Workspace"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's what's happening with your work.
                    </p>
                </div>

                {/* REFRESH BUTTON */}

                <button
                    type="button"
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-700
                        shadow-sm
                        transition
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing ? "animate-spin" : ""
                        }
                    />

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* REFRESH ERROR MESSAGE */}

            {error && (
                <div
                    className="
                        rounded-xl
                        border
                        border-amber-100
                        bg-amber-50
                        px-4
                        py-3
                        text-sm
                        text-amber-700
                    "
                >
                    {error}
                </div>
            )}

            {/* DASHBOARD STATISTICS CARDS */}

            <div
                className="
                    grid
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                <ReportStatCard
                    title="Projects"
                    value={stats.totalProjects ?? 0}
                    subtitle="Your accessible projects"
                    icon={FolderKanban}
                />

                <ReportStatCard
                    title="My Tasks"
                    value={stats.totalMyTasks ?? 0}
                    subtitle="Tasks assigned to you"
                    icon={ListTodo}
                />

                <ReportStatCard
                    title="Completed"
                    value={stats.completedTasks ?? 0}
                    subtitle="Your completed tasks"
                    icon={CheckCircle2}
                />

                <ReportStatCard
                    title="Tracked Time"
                    value={formatTime(stats.totalTimeSeconds ?? 0)}
                    subtitle="Your total tracked time"
                    icon={Clock3}
                />
            </div>

            {/* OVERDUE TASKS */}

            <OverdueTasks
                tasks={dashboard?.overdueTasks ?? []}
            />

            {/* TASK OVERVIEW AND UPCOMING TASKS */}

            <div
                className="
                    grid
                    gap-6
                    xl:grid-cols-2
                "
            >
                <TaskOverview
                    overview={dashboard?.taskOverview ?? {}}
                />

                <DueSoonTasks
                    tasks={dashboard?.dueSoon ?? []}
                />
            </div>

            {/* WEEKLY TIME TRACKING CHART */}

            <WeeklyTimeChart
                data={dashboard?.weeklyTime ?? []}
            />

            {/* PROJECT PROGRESS AND RECENT ACTIVITY */}

            <div
                className="
                    grid
                    gap-6
                    xl:grid-cols-2
                "
            >
                <ProjectProgress
                    projects={dashboard?.projectProgress ?? []}
                />

                <RecentActivity
                    activities={dashboard?.recentActivity ?? []}
                />
            </div>

        </div>
    );
}
