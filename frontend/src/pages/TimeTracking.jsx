import {
    useEffect,
    useState
} from "react";

import {
    Clock3,
    CalendarDays,
    Play,
    Plus,
    History
} from "lucide-react";

import {
    timeService
} from "../services/timeService";

import {
    taskService
} from "../services/taskService";

import {
    useAuth
} from "../context/AuthContext";

import ActiveTimer
    from "../components/time/ActiveTimer";

import ManualTimeModal
    from "../components/time/ManualTimeModal";

import {
    formatDuration,
    formatHoursMinutes
} from "../utils/time";


export default function TimeTracking() {

    const { user } = useAuth();

    const [tasks, setTasks] =
        useState([]);

    const [entries, setEntries] =
        useState([]);

    const [summary, setSummary] =
        useState({
            todaySeconds: 0,
            weekSeconds: 0,
            weekEntries: 0
        });

    const [activeTimer, setActiveTimer] =
        useState(null);

    const [selectedTask, setSelectedTask] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [starting, setStarting] =
        useState(false);

    const [stopping, setStopping] =
        useState(false);

    const [savingManual, setSavingManual] =
        useState(false);

    const [manualOpen, setManualOpen] =
        useState(false);

    const [error, setError] =
        useState("");


    const loadData = async () => {

        try {

            setLoading(true);
            setError("");


            const [
                taskData,
                entryData,
                summaryData,
                activeData
            ] = await Promise.all([

                taskService.getAll(),

                timeService.getEntries(),

                timeService.getSummary(),

                timeService.getActive()

            ]);


            setTasks(taskData);
            setEntries(entryData);
            setSummary(summaryData);
            setActiveTimer(activeData);


        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load time tracking data"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    const currentUserId =
        String(
            user?._id ||
            user?.id
        );


    const trackableTasks =
        tasks.filter((task) => {

            const ownerId =
                task.project?.owner?._id ||
                task.project?.owner;

            const assigneeId =
                task.assignedTo?._id ||
                task.assignedTo;


            return (
                String(ownerId) ===
                    currentUserId
                ||
                String(assigneeId) ===
                    currentUserId
            );

        });


    const handleStart = async () => {

        if (!selectedTask) {

            setError(
                "Please select a task first"
            );

            return;

        }


        try {

            setStarting(true);
            setError("");


            const timer =
                await timeService.start(
                    selectedTask
                );


            setActiveTimer(timer);


        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to start timer"
            );

        } finally {

            setStarting(false);

        }

    };


    const handleStop = async () => {

        try {

            setStopping(true);
            setError("");


            await timeService.stop();

            setActiveTimer(null);

            await loadData();


        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to stop timer"
            );

        } finally {

            setStopping(false);

        }

    };


    const handleManualEntry =
        async (data) => {

            setSavingManual(true);

            try {

                await timeService.addManual(
                    data
                );

                setManualOpen(false);

                await loadData();

            } finally {

                setSavingManual(false);

            }

        };


    if (loading) {

        return (

            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
                text-slate-500
            ">

                Loading time tracking...

            </div>

        );

    }


    return (

        <div className="space-y-8">

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

                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Time Tracking
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Track time spent on tasks and monitor your weekly work.
                    </p>

                </div>


                <button
                    onClick={() =>
                        setManualOpen(true)
                    }
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-slate-700
                        hover:bg-slate-50
                    "
                >

                    <Plus size={18} />

                    Manual Entry

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50
                    p-4
                    text-sm
                    text-red-600
                ">

                    {error}

                </div>

            )}


            {/* SUMMARY */}

            <div className="
                grid
                gap-4
                md:grid-cols-3
            ">

                <SummaryCard
                    title="Today"
                    value={
                        formatHoursMinutes(
                            summary.todaySeconds
                        )
                    }
                    icon={Clock3}
                />

                <SummaryCard
                    title="This Week"
                    value={
                        formatHoursMinutes(
                            summary.weekSeconds
                        )
                    }
                    icon={CalendarDays}
                />

                <SummaryCard
                    title="Week Entries"
                    value={
                        summary.weekEntries
                    }
                    icon={History}
                />

            </div>


            {/* ACTIVE TIMER */}

            <ActiveTimer
                activeTimer={activeTimer}
                onStop={handleStop}
                stopping={stopping}
            />


            {/* START TIMER */}

            {!activeTimer && (

                <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                ">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Start Tracking
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Select the task you are currently working on.
                    </p>


                    <div className="
                        mt-5
                        flex
                        flex-col
                        gap-3
                        md:flex-row
                    ">

                        <select
                            value={selectedTask}
                            onChange={(event) =>
                                setSelectedTask(
                                    event.target.value
                                )
                            }
                            className="
                                flex-1
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-3
                                text-sm
                            "
                        >

                            <option value="">
                                Select Task
                            </option>


                            {trackableTasks.map(
                                (task) => (

                                    <option
                                        key={task._id}
                                        value={task._id}
                                    >

                                        {task.title}
                                        {" — "}
                                        {task.project?.name}

                                    </option>

                                )
                            )}

                        </select>


                        <button
                            onClick={handleStart}
                            disabled={
                                starting ||
                                !selectedTask
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-indigo-600
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                hover:bg-indigo-700
                                disabled:opacity-50
                            "
                        >

                            <Play size={17} />

                            {starting
                                ? "Starting..."
                                : "Start Timer"}

                        </button>

                    </div>

                </div>

            )}


            {/* HISTORY */}

            <div className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
            ">

                <div className="
                    border-b
                    border-slate-100
                    px-6
                    py-5
                ">

                    <h2 className="font-semibold text-slate-900">
                        Recent Time Entries
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Your recently recorded work.
                    </p>

                </div>


                {entries.length === 0 ? (

                    <div className="
                        px-6
                        py-16
                        text-center
                        text-sm
                        text-slate-500
                    ">

                        No time entries yet.

                    </div>

                ) : (

                    <div className="divide-y divide-slate-100">

                        {entries
                            .slice(0, 15)
                            .map((entry) => (

                                <div
                                    key={entry._id}
                                    className="
                                        flex
                                        flex-col
                                        gap-4
                                        px-6
                                        py-4
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                    "
                                >

                                    <div>

                                        <p className="font-medium text-slate-900">

                                            {entry.task?.title}

                                        </p>

                                        <div className="
                                            mt-1
                                            flex
                                            flex-wrap
                                            gap-x-3
                                            gap-y-1
                                            text-xs
                                            text-slate-500
                                        ">

                                            <span>
                                                {entry.project?.name}
                                            </span>

                                            <span>
                                                {new Date(
                                                    entry.startTime
                                                ).toLocaleDateString(
                                                    "en-IN"
                                                )}
                                            </span>

                                            <span className="capitalize">
                                                {entry.type}
                                            </span>

                                        </div>


                                        {entry.description && (

                                            <p className="mt-2 text-sm text-slate-500">
                                                {entry.description}
                                            </p>

                                        )}

                                    </div>


                                    <div className="
                                        font-mono
                                        text-lg
                                        font-semibold
                                        text-slate-900
                                    ">

                                        {formatDuration(
                                            entry.duration
                                        )}

                                    </div>

                                </div>

                            ))}

                    </div>

                )}

            </div>


            <ManualTimeModal
                isOpen={manualOpen}
                onClose={() =>
                    setManualOpen(false)
                }
                onSubmit={
                    handleManualEntry
                }
                tasks={
                    trackableTasks
                }
                saving={
                    savingManual
                }
            />

        </div>

    );
}


function SummaryCard({
    title,
    value,
    icon: Icon
}) {

    return (

        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
        ">

            <div className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
            ">

                <Icon size={21} />

            </div>


            <p className="mt-5 text-2xl font-bold text-slate-900">
                {value}
            </p>

            <p className="mt-1 text-sm text-slate-500">
                {title}
            </p>

        </div>

    );
}