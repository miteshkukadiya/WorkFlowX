import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";

import { auditService } from "../services/auditService";
import { useWorkspace } from "../context/WorkspaceContext";

export default function WorkspaceAuditLogs() {
    const { activeWorkspace } = useWorkspace();

    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setPage(1);
        setLogs([]);
    }, [activeWorkspace?._id]);

    useEffect(() => {
        if (!activeWorkspace?._id) return;

        let cancelled = false;

        const loadLogs = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await auditService.getLogs(page);

                if (!cancelled) {
                    setLogs(data.logs);
                    setTotalPages(data.pagination.totalPages);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load audit logs"
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadLogs();

        return () => {
            cancelled = true;
        };
    }, [activeWorkspace?._id, page]);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div>
                <div className="flex items-center gap-3">
                    <ScrollText className="text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900">
                        Workspace Audit Logs
                    </h1>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                    Review important administrative actions.
                </p>
            </div>

            {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">User</th>
                            <th className="px-5 py-4">Action</th>
                            <th className="px-5 py-4">Target</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td className="px-5 py-4 text-slate-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>

                                <td className="px-5 py-4">
                                    {log.actor?.name || "Unknown user"}
                                </td>

                                <td className="px-5 py-4 font-medium">
                                    {log.action}
                                </td>

                                <td className="px-5 py-4 text-slate-500">
                                    {log.targetType}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && logs.length === 0 && (
                    <p className="p-6 text-center text-slate-500">
                        No audit records found.
                    </p>
                )}

                {loading && (
                    <p className="p-6 text-center text-slate-500">
                        Loading audit logs...
                    </p>
                )}
            </div>

            <div className="flex items-center justify-end gap-3">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(previous => previous - 1)}
                    className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
                >
                    Previous
                </button>

                <span className="text-sm text-slate-600">
                    Page {page} of {Math.max(1, totalPages)}
                </span>

                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(previous => previous + 1)}
                    className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}