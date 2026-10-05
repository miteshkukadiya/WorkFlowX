import {
    Bell,
    CheckCheck,
    MessageSquare,
    Trash2,
    UserPlus,
    ListTodo,
    RefreshCw
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import {
    useNotifications
} from "../../context/NotificationContext";


const formatTime = (
    date
) => {

    const created =
        new Date(date);

    const now =
        new Date();

    const seconds =
        Math.floor(
            (
                now - created
            ) / 1000
        );


    if (seconds < 60) {
        return "Just now";
    }


    if (seconds < 3600) {

        return `${Math.floor(
            seconds / 60
        )}m ago`;

    }


    if (seconds < 86400) {

        return `${Math.floor(
            seconds / 3600
        )}h ago`;

    }


    if (
        seconds <
        86400 * 7
    ) {

        return `${Math.floor(
            seconds / 86400
        )}d ago`;

    }


    return created
        .toLocaleDateString(
            "en-IN"
        );

};


const getIcon = (
    type
) => {

    switch (type) {

        case "project_member_added":
            return UserPlus;

        case "task_assigned":
            return ListTodo;

        case "comment_added":
            return MessageSquare;

        case "task_status_changed":
            return RefreshCw;

        default:
            return Bell;

    }

};


export default function NotificationDropdown({
    onClose
}) {

    const navigate =
        useNavigate();


    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        removeNotification
    } = useNotifications();


    const handleNotificationClick =
        async (
            notification
        ) => {

            if (
                !notification.isRead
            ) {

                await markAsRead(
                    notification._id
                );

            }


            onClose?.();


            if (
                notification.task?._id
            ) {

                navigate(
                    `/tasks/${notification.task._id}`
                );

                return;

            }


            if (
                notification.project?._id
            ) {

                navigate(
                    "/projects"
                );

                return;

            }

        };


    const handleDelete =
        async (
            event,
            id
        ) => {

            event.stopPropagation();

            await removeNotification(
                id
            );

        };


    return (

        <div className="
            absolute
            right-0
            top-full
            z-50
            mt-3
            w-[calc(100vw-2rem)]
            max-w-[390px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
        ">

            {/* HEADER */}

            <div className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-4
            ">

                <div>

                    <h3 className="
                        font-bold
                        text-slate-900
                    ">

                        Notifications

                    </h3>

                    <p className="
                        mt-0.5
                        text-xs
                        text-slate-500
                    ">

                        {unreadCount}
                        {" "}
                        unread

                    </p>

                </div>


                {unreadCount > 0 && (

                    <button
                        onClick={
                            markAllAsRead
                        }
                        className="
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-indigo-600
                            hover:text-indigo-700
                        "
                    >

                        <CheckCheck
                            size={15}
                        />

                        Mark all read

                    </button>

                )}

            </div>


            {/* CONTENT */}

            <div className="
                max-h-[430px]
                overflow-y-auto
            ">

                {loading ? (

                    <div className="
                        py-12
                        text-center
                        text-sm
                        text-slate-500
                    ">

                        Loading notifications...

                    </div>

                ) : notifications.length ===
                    0 ? (

                    <div className="
                        px-6
                        py-14
                        text-center
                    ">

                        <div className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-100
                            text-slate-400
                        ">

                            <Bell
                                size={22}
                            />

                        </div>


                        <p className="
                            mt-4
                            font-medium
                            text-slate-700
                        ">

                            No notifications

                        </p>


                        <p className="
                            mt-1
                            text-xs
                            text-slate-500
                        ">

                            You're all caught up.

                        </p>

                    </div>

                ) : (

                    notifications.map(
                        (
                            notification
                        ) => {

                            const Icon =
                                getIcon(
                                    notification.type
                                );


                            return (

                                <button
                                    key={
                                        notification._id
                                    }
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                    className={`
                                        group
                                        relative
                                        flex
                                        w-full
                                        gap-3
                                        border-b
                                        border-slate-100
                                        px-5
                                        py-4
                                        text-left
                                        transition
                                        hover:bg-slate-50
                                        ${
                                            !notification.isRead
                                                ? "bg-indigo-50/50"
                                                : "bg-white"
                                        }
                                    `}
                                >

                                    <div className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-indigo-100
                                        text-indigo-600
                                    ">

                                        <Icon
                                            size={18}
                                        />

                                    </div>


                                    <div className="
                                        min-w-0
                                        flex-1
                                    ">

                                        <div className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-2
                                        ">

                                            <p className="
                                                text-sm
                                                font-semibold
                                                text-slate-900
                                            ">

                                                {
                                                    notification.title
                                                }

                                            </p>


                                            {!notification.isRead && (

                                                <span className="
                                                    mt-1.5
                                                    h-2
                                                    w-2
                                                    shrink-0
                                                    rounded-full
                                                    bg-indigo-600
                                                " />

                                            )}

                                        </div>


                                        <p className="
                                            mt-1
                                            line-clamp-2
                                            text-xs
                                            leading-5
                                            text-slate-500
                                        ">

                                            {
                                                notification.message
                                            }

                                        </p>


                                        <div className="
                                            mt-2
                                            flex
                                            items-center
                                            justify-between
                                        ">

                                            <span className="
                                                text-[11px]
                                                text-slate-400
                                            ">

                                                {
                                                    formatTime(
                                                        notification.createdAt
                                                    )
                                                }

                                            </span>


                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={(
                                                    event
                                                ) =>
                                                    handleDelete(
                                                        event,
                                                        notification._id
                                                    )
                                                }
                                                className="
                                                    rounded-md
                                                    p-1
                                                    text-slate-300
                                                    opacity-0
                                                    transition
                                                    hover:bg-rose-50
                                                    hover:text-rose-600
                                                    group-hover:opacity-100
                                                "
                                            >

                                                <Trash2
                                                    size={13}
                                                />

                                            </span>

                                        </div>

                                    </div>

                                </button>

                            );

                        }
                    )

                )}

            </div>

        </div>

    );
}