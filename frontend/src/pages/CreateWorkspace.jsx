import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

import { organizationService } from "../services/organizationService";
import { useWorkspace } from "../context/WorkspaceContext";

export default function CreateWorkspace() {
    const navigate = useNavigate();
    const { refreshWorkspaces } = useWorkspace();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await organizationService.create(name);

            await refreshWorkspaces();

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create workspace"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl py-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Building2 size={24} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                    Create Workspace
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Create a workspace for your company or team.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Workspace Name
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="e.g. Alpha Technologies"
                            minLength={2}
                            maxLength={100}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Workspace"}
                    </button>
                </form>
            </div>
        </div>
    );
}