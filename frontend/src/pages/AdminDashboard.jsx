import { useCallback, useEffect, useState } from "react";
import {
    Building2, CreditCard, RefreshCw, ShieldAlert, Users
} from "lucide-react";
import { platformAdminService } from "../services/platformAdminService";

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";
const money = (value, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value || 0);

function Stat({ label, value, icon: Icon, tone = "cyan" }) {
    const toneClasses = {
        cyan: "bg-blue-50 text-blue-600",
        violet: "bg-violet-50 text-violet-600",
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600"
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
                <Icon size={20} />
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function Table({ columns, rows, empty = "No records found." }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>{columns.map(({ key, label }) => <th key={key} className="px-4 py-3 font-semibold">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.length ? rows.map((row, index) => (
                        <tr key={row._id || row.id || index} className="text-slate-600 transition hover:bg-slate-50">
                            {columns.map(({ key, render }) => <td key={key} className="px-4 py-3">{render ? render(row) : row[key] ?? "-"}</td>)}
                        </tr>
                    )) : <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default function AdminDashboard({ section = "overview" }) {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            if (section === "overview") {
                const [overview, revenue, subscriptions, recent] = await Promise.all([
                    platformAdminService.getOverview(),
                    platformAdminService.getRevenue(),
                    platformAdminService.getDashboardSubscriptionStats(),
                    platformAdminService.getRecentOrganizations()
                ]);
                setData({ overview, revenue, subscriptions, recent });
            } else if (section === "organizations") {
                setData({ list: await platformAdminService.getOrganizations({ page, limit: 10, search: query }) });
            } else if (section === "users") {
                setData({ list: await platformAdminService.getUsers({ page, limit: 10, search: query }) });
            } else if (section === "subscriptions") {
                setData({ list: await platformAdminService.getSubscriptions({ page, limit: 10, search: query }) });
            } else if (section === "payments") {
                setData({ list: await platformAdminService.getPayments({ page, limit: 10, search: query }) });
            } else {
                setData({ list: await platformAdminService.getAuditLogs({ page, limit: 10, search: query }) });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load administrator data.");
        } finally {
            setLoading(false);
        }
    }, [page, query, section]);

    useEffect(() => {
        const timer = setTimeout(() => load(), 0);
        return () => clearTimeout(timer);
    }, [load]);

    const title = section === "overview" ? "Platform overview" : section[0].toUpperCase() + section.slice(1);
    const overview = data.overview;
    const organizations = data.list?.organizations || [];
    const users = data.list?.users || [];
    const subscriptions = data.list?.subscriptions || [];
    const payments = data.list?.payments || [];
    const auditLogs = data.list?.logs || [];
    const rows = section === "organizations" ? organizations : section === "users" ? users : section === "subscriptions" ? subscriptions : section === "payments" ? payments : auditLogs;

    const columns = (() => {
        if (section === "organizations") return [
            { key: "name", label: "Organization" },
            { key: "status", label: "Status" },
            { key: "activeMembers", label: "Members" },
            { key: "createdAt", label: "Created", render: row => formatDate(row.createdAt) },
            { key: "action", label: "Action", render: row => <button onClick={() => platformAdminService.setOrganizationStatus(row._id, row.status === "active" ? "suspend" : "activate").then(load)} className="font-semibold text-blue-600 hover:text-blue-800">{row.status === "active" ? "Suspend" : "Activate"}</button> }
        ];
        if (section === "users") return [
            { key: "name", label: "User" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
            { key: "accountStatus", label: "Status" },
            { key: "action", label: "Action", render: row => <button onClick={() => platformAdminService.setUserStatus(row._id, row.accountStatus === "active" ? "suspend" : "activate").then(load)} className="font-semibold text-blue-600 hover:text-blue-800">{row.accountStatus === "active" ? "Suspend" : "Activate"}</button> }
        ];
        if (section === "subscriptions") return [
            { key: "organization", label: "Organization", render: row => row.organization?.name },
            { key: "plan", label: "Plan", render: row => row.plan?.name },
            { key: "status", label: "Status" },
            { key: "currentPeriodEnd", label: "Period end", render: row => formatDate(row.currentPeriodEnd) }
        ];
        if (section === "payments") return [
            { key: "razorpayPaymentId", label: "Payment ID" },
            { key: "amount", label: "Amount", render: row => money(row.amount / 100, row.currency || "INR") },
            { key: "status", label: "Status" },
            { key: "paidAt", label: "Paid", render: row => formatDate(row.paidAt) }
        ];
        return [
            { key: "action", label: "Action" },
            { key: "targetUser", label: "Target user", render: row => row.targetUser || row.targetOrganization || "-" },
            { key: "createdAt", label: "Date", render: row => formatDate(row.createdAt) }
        ];
    })();

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Platform administration</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2><p className="mt-2 text-slate-500">Monitor and manage your WorkflowX SaaS platform.</p></div>
                {section !== "overview" && <div className="flex gap-2"><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === "Enter" && (setPage(1), load())} placeholder={`Search ${section}...`} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /><button onClick={load} className="rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm transition hover:bg-slate-700" aria-label="Refresh"><RefreshCw size={18} /></button></div>}
            </div>

            {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
            {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">Loading...</div> : section === "overview" ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Stat label="Organizations" value={overview?.organizations?.total || 0} icon={Building2} />
                        <Stat label="Users" value={overview?.users?.total || 0} icon={Users} tone="violet" />
                        <Stat label="Active subscriptions" value={overview?.subscriptions?.active || 0} icon={CreditCard} tone="emerald" />
                        <Stat label="Past due" value={overview?.subscriptions?.pastDue || 0} icon={ShieldAlert} tone="rose" />
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 font-semibold text-slate-900">Revenue this month</h3>{data.revenue?.currencyBreakdown?.map(item => <div key={item.currency} className="flex justify-between border-b border-slate-100 py-3 text-sm"><span className="text-slate-500">{item.currency}</span><strong className="text-emerald-600">{money(item.monthlyRevenue, item.currency)}</strong></div>) || <p className="text-slate-500">No revenue data.</p>}</div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 font-semibold text-slate-900">Recent organizations</h3><Table columns={[{ key: "name", label: "Name" }, { key: "status", label: "Status" }, { key: "createdAt", label: "Created", render: row => formatDate(row.createdAt) }]} rows={data.recent?.organizations || []} /></div>
                    </div>
                </>
            ) : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><Table columns={columns} rows={rows} /><div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500"><span>Page {data.list?.pagination?.currentPage || page} of {data.list?.pagination?.totalPages || 1}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(current => current - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-40">Previous</button><button disabled={page >= (data.list?.pagination?.totalPages || 1)} onClick={() => setPage(current => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-40">Next</button></div></div></div>}
        </div>
    );
}
