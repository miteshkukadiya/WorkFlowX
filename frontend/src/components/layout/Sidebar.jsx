import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Clock3,
    BarChart3,
    Users,
    Settings,
    X
} from "lucide-react";

const Sidebar = ({
    isOpen,
    onClose
}) => {

    const navigation = [
        {
            label: "Overview",
            icon: LayoutDashboard
        },
        {
            label: "Projects",
            icon: FolderKanban
        },
        {
            label: "My Tasks",
            icon: CheckSquare
        },
        {
            label: "Time Tracking",
            icon: Clock3
        },
        {
            label: "Reports",
            icon: BarChart3
        },
        {
            label: "Team",
            icon: Users
        }
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex w-[17rem] flex-col
                    border-r border-slate-200
                    bg-white
                    transition-transform duration-300
                    lg:static lg:translate-x-0
                    ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"}
                `}
            >

                {/* Logo */}

                <div className="flex h-[4.5rem] items-center justify-between border-b border-slate-100 px-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white shadow-sm shadow-slate-300">
                            W
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                WorkFlowX
                            </h1>

                            <p className="text-xs text-slate-400">
                                Team workspace
                            </p>
                        </div>

                    </div>

                    <button
                        aria-label="Close navigation"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* Workspace */}

                <div className="px-4 py-5">

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

                        <p className="text-xs font-medium text-slate-400">
                            WORKSPACE
                        </p>

                        <div className="mt-2 flex items-center justify-between">

                            <span className="text-sm font-semibold text-slate-800">
                                Acme Workspace
                            </span>

                            <span className="text-xs text-slate-400">
                                Free
                            </span>

                        </div>

                    </div>

                </div>


                {/* Navigation */}

                <nav className="flex-1 px-4">

                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Workspace
                    </p>

                    <div className="space-y-1">

                        {navigation.map((item) => {

                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.label}
                                    className={`
                                        flex w-full items-center gap-3
                                        rounded-xl px-3 py-2.5
                                        text-sm font-medium
                                        transition-colors
                                        ${
                                            item.label === "Overview"
                                                ? "bg-slate-900 text-white shadow-sm shadow-slate-200"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }
                                    `}
                                >

                                    <Icon size={18} />

                                    {item.label}

                                </button>
                            );

                        })}

                    </div>

                </nav>


                {/* Bottom */}

                <div className="border-t border-slate-100 p-4">

                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">

                        <Settings size={18} />

                        Settings

                    </button>

                </div>

            </aside>
        </>
    );
};

export default Sidebar;