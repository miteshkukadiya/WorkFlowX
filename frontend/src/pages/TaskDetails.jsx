import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    FolderKanban,
    MessageSquare,
    UserRound
} from "lucide-react";

import {
    Link,
    useParams
} from "react-router-dom";

import {
    taskService
} from "../services/taskService";

import {
    commentService
} from "../services/commentService";

import {
    activityService
} from "../services/activityService";

import {
    useAuth
} from "../context/AuthContext";

import CommentsSection
    from "../components/comments/CommentsSection";

import ActivityTimeline
    from "../components/activity/ActivityTimeline";


export default function TaskDetails() {

    const {
        id
    } = useParams();

    const {
        user
    } = useAuth();


    const [task, setTask] =
        useState(null);

    const [comments, setComments] =
        useState([]);

    const [activities, setActivities] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadTaskData =
        useCallback(async () => {

            try {

                setLoading(true);
                setError("");


                const [
                    taskData,
                    commentData,
                    activityData
                ] = await Promise.all([

                    taskService.getById(
                        id
                    ),

                    commentService.getByTask(
                        id
                    ),

                    activityService.getByTask(
                        id
                    )

                ]);


                setTask(taskData);
                setComments(commentData);
                setActivities(activityData);


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Failed to load task"
                );

            } finally {

                setLoading(false);

            }

        }, [id]);


    useEffect(() => {

        loadTaskData();

    }, [loadTaskData]);


    if (loading) {

        return (

            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
                text-slate-500
            ">

                Loading task...

            </div>

        );

    }


    if (error || !task) {

        return (

            <div className="
                rounded-xl
                border
                border-red-100
                bg-red-50
                p-5
                text-red-600
            ">

                {error || "Task not found"}

            </div>

        );

    }


    const currentUserId =
        String(
            user?._id ||
            user?.id
        );


    const projectOwnerId =
        String(
            task.project
                ?.owner
                ?._id ||
            task.project
                ?.owner ||
            ""
        );


    const isProjectOwner =
        currentUserId ===
        projectOwnerId;


    return (

        <div className="space-y-6">

            <Link
                to="/tasks"
                className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-slate-500
                    hover:text-indigo-600
                "
            >

                <ArrowLeft size={17} />

                Back to Tasks

            </Link>


            {/* TASK */}

            <div className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
            ">

                <div className="
                    flex
                    flex-col
                    justify-between
                    gap-4
                    md:flex-row
                ">

                    <div>

                        <div className="
                            flex
                            flex-wrap
                            gap-2
                        ">

                            <span className="
                                rounded-full
                                bg-indigo-50
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                capitalize
                                text-indigo-700
                            ">

                                {task.status}

                            </span>


                            <span className="
                                rounded-full
                                bg-slate-100
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                capitalize
                                text-slate-600
                            ">

                                {task.priority}

                            </span>

                        </div>


                        <h1 className="
                            mt-4
                            text-2xl
                            font-bold
                            text-slate-900
                            sm:text-3xl
                        ">

                            {task.title}

                        </h1>


                        <p className="
                            mt-3
                            max-w-3xl
                            whitespace-pre-wrap
                            text-sm
                            leading-6
                            text-slate-600
                        ">

                            {task.description ||
                                "No description provided."}

                        </p>

                    </div>

                </div>


                <div className="
                    mt-6
                    grid
                    gap-4
                    border-t
                    border-slate-100
                    pt-6
                    sm:grid-cols-2
                    xl:grid-cols-4
                ">

                    <InfoItem
                        icon={FolderKanban}
                        label="Project"
                        value={
                            task.project
                                ?.name ||
                            "Unknown"
                        }
                    />


                    <InfoItem
                        icon={UserRound}
                        label="Assigned To"
                        value={
                            task.assignedTo
                                ?.name ||
                            "Unassigned"
                        }
                    />


                    <InfoItem
                        icon={CalendarDays}
                        label="Due Date"
                        value={
                            task.dueDate
                                ? new Date(
                                    task.dueDate
                                ).toLocaleDateString(
                                    "en-IN"
                                )
                                : "No deadline"
                        }
                    />


                    <InfoItem
                        icon={Clock3}
                        label="Estimate"
                        value={
                            `${task.estimatedHours || 0} hours`
                        }
                    />

                </div>

            </div>


            {/* COMMENTS + ACTIVITY */}

            <div className="
                grid
                gap-6
                xl:grid-cols-[1.4fr_1fr]
            ">

                <CommentsSection
                    taskId={task._id}
                    comments={comments}
                    setComments={
                        setComments
                    }
                    currentUserId={
                        currentUserId
                    }
                    isProjectOwner={
                        isProjectOwner
                    }
                    onActivityRefresh={
                        async () => {

                            const data =
                                await activityService
                                    .getByTask(
                                        task._id
                                    );

                            setActivities(
                                data
                            );

                        }
                    }
                />


                <ActivityTimeline
                    activities={
                        activities
                    }
                />

            </div>

        </div>

    );
}


function InfoItem({
    icon: Icon,
    label,
    value
}) {

    return (

        <div className="
            flex
            items-start
            gap-3
        ">

            <div className="
                rounded-lg
                bg-slate-100
                p-2
                text-slate-500
            ">

                <Icon size={17} />

            </div>


            <div>

                <p className="
                    text-xs
                    text-slate-500
                ">

                    {label}

                </p>

                <p className="
                    mt-1
                    text-sm
                    font-medium
                    text-slate-800
                ">

                    {value}

                </p>

            </div>

        </div>

    );
}