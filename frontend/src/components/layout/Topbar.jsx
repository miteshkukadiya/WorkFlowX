import {
    Menu,
    Bell,
    Search,
    LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {useAuth} from "../../context/AuthContext";

import { useEffect, useRef, useState } from "react";

import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "../notifications/NotificationDropdown";




const Topbar = ({
    onMenuClick
}) => {

    const {user , logout} = useAuth();

    const navigate = useNavigate();

    const [ notificationOpen,  setNotificationOpen ]  = useState(false);
    const notificationRef = useRef(null);
    const { unreadCount } = useNotifications();


    useEffect(() => {

        const handleOutsideClick = (
            event
        ) => {

            if (
                notificationRef.current &&
                !notificationRef.current
                    .contains(
                        event.target
                    )
            ) {

                setNotificationOpen(
                    false
                );

            }

        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    const handleLogout = async () => {
        try {
            await logout();

            navigate("/login", {
                replace: true
            });

        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    return (
        <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3 py-3 backdrop-blur sm:px-5 lg:px-8">

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                <button
                    aria-label="Open navigation"
                    onClick={onMenuClick}
                    className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                >
                    <Menu size={22} />
                </button>


                <div className="relative hidden sm:block">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-64 max-w-[calc(100vw-7rem)] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
                    />

                </div>

            </div>


            <div className="flex shrink-0 items-center gap-1 sm:gap-3">

                {/* <button aria-label="View notifications" className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">

                    <Bell size={19} />

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

                </button> */}

                <div
                    ref={notificationRef}
                    className="relative"
                >

                    <button
                        aria-label="View notifications"
                        onClick={() =>
                            setNotificationOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="
                            relative
                            rounded-xl
                            p-2.5
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                        "
                    >

                        <Bell size={20} />


                        {unreadCount > 0 && (

                            <span className="
                                absolute
                                -right-1
                                -top-1
                                flex
                                min-h-[18px]
                                min-w-[18px]
                                items-center
                                justify-center
                                rounded-full
                                bg-rose-500
                                px-1
                                text-[10px]
                                font-bold
                                text-white
                            ">

                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}

                            </span>

                        )}

                    </button>


                    {notificationOpen && (

                        <NotificationDropdown
                            onClose={() =>
                                setNotificationOpen(
                                    false
                                )
                            }
                        />

                    )}

                </div>


                <div className="flex items-center gap-3 border-l border-slate-200 pl-3">

                    <div className="hidden text-right sm:block">

                        <p className="text-sm font-semibold text-slate-800">
                             {user?.name || "User"}
                        </p>

                        <p className="text-xs text-slate-400">
                            {user?.role || "Employee"}
                        </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                       {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    {/* <button
                        onClick={() => {

                            logout();

                            navigate("/login", {
                                replace: true
                            });

                        }}
                        title="Logout"
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={18} />
                    </button> */}

                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={18} />
                    </button>

                </div>

            </div>

        </header>
    );
};

export default Topbar;