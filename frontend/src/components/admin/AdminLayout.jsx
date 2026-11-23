import { useState } from "react";
import { CreditCard, FileClock, LayoutDashboard, Menu, ShieldCheck, Users, X, LogOut, ChevronRight } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/organizations", label: "Organizations", icon: ShieldCheck },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/audit-logs", label: "Audit logs", icon: FileClock }
];

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const signOut = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
            <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/30 transition-transform lg:static lg:translate-x-0 lg:shadow-none`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">W</div>
                            <div>
                                <p className="text-base font-bold tracking-tight text-slate-900">WorkflowX</p>
                                <p className="text-xs text-slate-400">Admin workspace</p>
                            </div>
                        </div>
                    </div>
                    <button className="rounded-lg p-2 text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
                        <X size={20} />
                    </button>
                </div>

                <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
                <nav className="mt-3 space-y-1">
                    {links.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) => `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            <span className="flex items-center gap-3"><Icon size={17} />{label}</span>
                            <ChevronRight size={15} className="opacity-0 transition group-hover:opacity-60" />
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-5 left-5 right-5 border-t border-slate-200 pt-5">
                    <p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Platform administrator"}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{user?.email}</p>
                    <button onClick={signOut} className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600">
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            {open && <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}

            <main className="min-w-0 flex-1 bg-slate-50">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
                    <button className="rounded-lg p-2 text-slate-500 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
                        <Menu size={22} />
                    </button>
                    <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> All systems operational
                    </div>
                </header>
                <div className="p-4 sm:p-8 lg:p-10">{children}</div>
            </main>
        </div>
    );
}
