import {
    useEffect,
    useState
} from "react";

import {
    CheckCircle2,
    Clock3,
    FolderKanban,
    ListTodo,
    RefreshCw,
    TrendingUp
} from "lucide-react";

import {
    reportService
} from "../services/reportService";

import ReportStatCard
    from "../components/reports/ReportStatCard";

import TaskStatusChart
    from "../components/reports/TaskStatusChart";

import PriorityChart
    from "../components/reports/PriorityChart";

import WeeklyTimeChart
    from "../components/reports/WeeklyTimeChart";

import ProjectProgress
    from "../components/reports/ProjectProgress";


const formatTrackedTime = (
    seconds = 0
) => {

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (
                seconds % 3600
            ) / 60
        );


    if (hours === 0) {
        return `${minutes}m`;
    }


    return `${hours}h ${minutes}m`;
};


export default function Reports() {

    const [
        report,
        setReport
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        refreshing,
        setRefreshing
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");


    const loadReport =
        async (
            isRefresh = false
        ) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }


                setError("");


                const data =
                    await reportService
                        .getDashboard();


                setReport(
                    data
                );


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to load reports"
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        };


    useEffect(() => {

        loadReport();

    }, []);


    if (loading) {

        return (

            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
            ">

                <div className="
                    text-center
                ">

                    <div className="
                        mx-auto
                        h-8
                        w-8
                        animate-spin
                        rounded-full
                        border-4
                        border-slate-200
                        border-t-indigo-600
                    " />


                    <p className="
                        mt-4
                        text-sm
                        text-slate-500
                    ">

                        Building your report...

                    </p>

                </div>

            </div>

        );

    }


    if (
        error &&
        !report
    ) {

        return (

            <div className="
                rounded-2xl
                border
                border-red-100
                bg-red-50
                p-6
            ">

                <p className="
                    font-semibold
                    text-red-700
                ">

                    Failed to load reports

                </p>


                <p className="
                    mt-1
                    text-sm
                    text-red-600
                ">

                    {error}

                </p>


                <button
                    onClick={() =>
                        loadReport()
                    }
                    className="
                        mt-4
                        rounded-lg
                        bg-red-600
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                    "
                >

                    Try Again

                </button>

            </div>

        );

    }


    const summary =
        report?.summary || {};


    return (

        <div className="
            space-y-6
        ">

            {/* HEADER */}

            <div className="
                flex
                flex-col
                justify-between
                gap-4
                sm:flex-row
                sm:items-center
            ">

                <div>

                    <h1 className="
                        text-2xl
                        font-bold
                        tracking-tight
                        text-slate-900
                        sm:text-3xl
                    ">

                        Reports & Analytics

                    </h1>


                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                    ">

                        Track project progress, tasks and productivity.

                    </p>

                </div>


                <button
                    onClick={() =>
                        loadReport(
                            true
                        )
                    }
                    disabled={
                        refreshing
                    }
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
                        hover:bg-slate-50
                        disabled:opacity-50
                    "
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {error && (

                <div className="
                    rounded-xl
                    bg-amber-50
                    px-4
                    py-3
                    text-sm
                    text-amber-700
                ">

                    {error}

                </div>

            )}


            {/* SUMMARY */}

            <div className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-5
            ">

                <ReportStatCard
                    title="Projects"
                    value={
                        summary
                            .totalProjects ||
                        0
                    }
                    subtitle="Accessible projects"
                    icon={
                        FolderKanban
                    }
                />


                <ReportStatCard
                    title="Total Tasks"
                    value={
                        summary
                            .totalTasks ||
                        0
                    }
                    subtitle="Across all projects"
                    icon={
                        ListTodo
                    }
                />


                <ReportStatCard
                    title="Completed"
                    value={
                        summary
                            .completedTasks ||
                        0
                    }
                    subtitle="Finished tasks"
                    icon={
                        CheckCircle2
                    }
                />


                <ReportStatCard
                    title="Completion"
                    value={
                        `${
                            summary
                                .completionRate ||
                            0
                        }%`
                    }
                    subtitle="Overall progress"
                    icon={
                        TrendingUp
                    }
                />


                <ReportStatCard
                    title="Tracked Time"
                    value={
                        formatTrackedTime(
                            summary
                                .totalTimeSeconds
                        )
                    }
                    subtitle="Total recorded time"
                    icon={
                        Clock3
                    }
                />

            </div>


            {/* CHARTS */}

            <div className="
                grid
                gap-6
                xl:grid-cols-2
            ">

                <TaskStatusChart
                    status={
                        report
                            ?.taskStatus
                    }
                />


                <PriorityChart
                    priority={
                        report
                            ?.priority
                    }
                />

            </div>


            <WeeklyTimeChart
                data={
                    report
                        ?.weeklyTime ||
                    []
                }
            />


            <ProjectProgress
                projects={
                    report
                        ?.projectProgress ||
                    []
                }
            />

        </div>

    );
}