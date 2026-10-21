import { useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    Trash2,
    Mail
} from "lucide-react";

import { workspaceTeamService } from "../services/workspaceTeamService";
import { useWorkspace } from "../context/WorkspaceContext";

const roles = ["admin", "manager", "member", "guest"];

export default function WorkspaceTeam() {
    const { activeWorkspace } = useWorkspace();

    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [invitationUrl, setInvitationUrl] = useState("");

    const canManage = ["owner", "admin"].includes(
        activeWorkspace?.myRole
    );

    useEffect(() => {
        if (!activeWorkspace?._id) return;

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                setMembers([]);
                setInvitations([]);

                const [memberData, inviteData] = await Promise.all([
                    workspaceTeamService.getMembers(),
                    canManage
                        ? workspaceTeamService.getInvitations()
                        : Promise.resolve([])
                ]);

                if (!cancelled) {
                    setMembers(memberData);
                    setInvitations(inviteData);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load team"
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [activeWorkspace?._id, canManage]);

    const sendInvitation = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");
            setInvitationUrl("");

            const result = await workspaceTeamService.invite(
                email,
                role
            );

            setEmail("");
            setMessage("Invitation created successfully.");

            // Development-only link; production uses email delivery.
            setInvitationUrl(result.data?.invitationUrl || "");

            const updated = await workspaceTeamService.getInvitations();
            setInvitations(updated);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create invitation"
            );
        } finally {
            setSaving(false);
        }
    };

    const changeRole = async (memberId, newRole) => {
        try {
            setError("");

            await workspaceTeamService.updateRole(
                memberId,
                newRole
            );

            setMembers(previous =>
                previous.map(member =>
                    member._id === memberId
                        ? { ...member, role: newRole }
                        : member
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update role"
            );
        }
    };

    const removeMember = async (memberId) => {
        if (!window.confirm("Remove this team member?")) {
            return;
        }

        try {
            setError("");

            await workspaceTeamService.removeMember(memberId);

            setMembers(previous =>
                previous.filter(member => member._id !== memberId)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to remove member"
            );
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Team Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage members of {activeWorkspace?.name}.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-indigo-700">
                    <Users size={19} />
                    <span className="text-sm font-semibold">
                        {members.length} Members
                    </span>
                </div>
            </div>

            {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            )}

            {message && (
                <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    {message}
                </p>
            )}

            {canManage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <UserPlus className="text-indigo-600" size={20} />
                        <h2 className="text-lg font-bold">
                            Invite Team Member
                        </h2>
                    </div>

                    <form
                        onSubmit={sendInvitation}
                        className="grid gap-3 md:grid-cols-[1fr_160px_auto]"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            placeholder="colleague@company.com"
                            required
                            className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                        />

                        <select
                            value={role}
                            onChange={event => setRole(event.target.value)}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                        >
                            {roles.map(item => (
                                <option key={item} value={item}>
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </option>
                            ))}
                        </select>

                        <button
                            disabled={saving}
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {saving ? "Creating..." : "Create Invite"}
                        </button>
                    </form>

                    {invitationUrl && (
                        <div className="mt-4 break-all rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                            Development-only invitation link: {invitationUrl}
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                    <h2 className="font-bold text-slate-900">
                        Workspace Members
                    </h2>
                </div>

                {loading ? (
                    <p className="p-6 text-sm text-slate-500">
                        Loading team...
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {members.map(member => (
                            <div
                                key={member._id}
                                className="flex flex-wrap items-center justify-between gap-4 p-5"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900">
                                        {member.user?.name || "Unknown user"}
                                    </p>
                                    <p className="truncate text-sm text-slate-500">
                                        {member.user?.email}
                                    </p>
                                    <p className="mt-1 text-xs capitalize text-slate-400">
                                        {member.status}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {canManage && member.role !== "owner" ? (
                                        <select
                                            value={member.role}
                                            onChange={event =>
                                                changeRole(
                                                    member._id,
                                                    event.target.value
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        >
                                            {roles.map(item => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm capitalize">
                                            {member.role}
                                        </span>
                                    )}

                                    {canManage && member.role !== "owner" && (
                                        <button
                                            onClick={() => removeMember(member._id)}
                                            aria-label="Remove member"
                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {members.length === 0 && (
                            <p className="p-6 text-sm text-slate-500">
                                No members found.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {canManage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Mail size={19} className="text-indigo-600" />
                        <h2 className="font-bold">Pending Invitations</h2>
                    </div>

                    <div className="space-y-3">
                        {invitations.map(invitation => (
                            <div
                                key={invitation._id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
                            >
                                <div>
                                    <p className="text-sm font-semibold">
                                        {invitation.email}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {invitation.role} · Expires{" "}
                                        {new Date(invitation.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            await workspaceTeamService.revokeInvitation(
                                                invitation._id
                                            );
                                            setInvitations(previous =>
                                                previous.filter(item =>
                                                    item._id !== invitation._id
                                                )
                                            );
                                        } catch (err) {
                                            setError(
                                                err.response?.data?.message ||
                                                "Unable to revoke invitation"
                                            );
                                        }
                                    }}
                                    className="text-sm font-semibold text-red-600"
                                >
                                    Revoke
                                </button>
                            </div>
                        ))}

                        {invitations.length === 0 && (
                            <p className="text-sm text-slate-500">
                                No pending invitations.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}