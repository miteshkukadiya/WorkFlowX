import { Building2, ChevronDown } from "lucide-react";

import { useWorkspace } from "../../context/WorkspaceContext";

export default function WorkspaceSwitcher() {
    const {
        workspaces,
        activeWorkspace,
        switchWorkspace,
        loading
    } = useWorkspace();

    if (loading) {
        return (
            <div className="rounded-xl bg-slate-100 p-3 text-sm">
                Loading workspaces...
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Building2 size={14} />
                Workspace
            </div>

            <div className="relative">
                <select
                    value={activeWorkspace?._id || ""}
                    onChange={(event) => {
                        switchWorkspace(event.target.value);

                        window.location.assign("/dashboard");
                    }}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500"
                >
                    {workspaces.length === 0 && (
                        <option value="">
                            No workspace
                        </option>
                    )}

                    {workspaces.map(workspace => (
                        <option
                            key={workspace._id}
                            value={workspace._id}
                        >
                            {workspace.name}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-3.5 text-slate-500"
                />
            </div>
        </div>
    );
}