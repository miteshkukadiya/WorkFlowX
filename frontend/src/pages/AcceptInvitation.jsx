import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { workspaceTeamService } from "../services/workspaceTeamService";
import { useWorkspace } from "../context/WorkspaceContext";

export default function AcceptInvitation() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { refreshWorkspaces, switchWorkspace } = useWorkspace();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = params.get("token");

    const accept = async () => {
        if (!token) {
            setError("Invitation token is missing.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                await workspaceTeamService.acceptInvitation(token);

            await refreshWorkspaces();

            // The user can select the new workspace from the switcher.
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to accept invitation"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md py-16">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">
                    Join Workspace
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                    Accept your invitation to collaborate with your team.
                </p>

                {error && (
                    <p role="alert" className="mt-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    onClick={accept}
                    disabled={!token || loading}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                    {loading ? "Joining..." : "Accept Invitation"}
                </button>
            </div>
        </div>
    );
}