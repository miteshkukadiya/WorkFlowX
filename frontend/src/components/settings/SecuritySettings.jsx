import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { settingsService } from "../../services/settingsService";

export default function SecuritySettings() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const update = (key, value) => {
        setForm(previous => ({
            ...previous,
            [key]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (form.newPassword !== form.confirmPassword) {
            setMessage("New passwords do not match.");
            return;
        }

        try {
            setSaving(true);

            await settingsService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setMessage("Password changed successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to change password."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
                <LockKeyhole className="text-indigo-600" size={22} />

                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Password & Security
                    </h2>

                    <p className="text-sm text-slate-500">
                        Protect your account with a strong password.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 max-w-xl space-y-5">
                {[
                    ["currentPassword", "Current Password"],
                    ["newPassword", "New Password"],
                    ["confirmPassword", "Confirm New Password"]
                ].map(([key, label]) => (
                    <div key={key}>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            {label}
                        </label>

                        <input
                            type="password"
                            autoComplete={
                                key === "currentPassword"
                                    ? "current-password"
                                    : "new-password"
                            }
                            value={form[key]}
                            onChange={(event) =>
                                update(key, event.target.value)
                            }
                            minLength={key === "currentPassword" ? 1 : 8}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />
                    </div>
                ))}

                <p className="text-xs text-slate-500">
                    Use at least 8 characters. A longer, unique password is recommended.
                </p>

                {message && (
                    <p role="status" className="text-sm text-slate-600">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}