import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { settingsService } from "../../services/settingsService";

const notificationOptions = [
    ["taskAssigned", "Task Assignments"],
    ["taskStatusChanged", "Task Status Changes"],
    ["comments", "New Comments"],
    ["projectInvites", "Project Invitations"]
];

export default function PreferencesSettings({
    profile,
    onUpdated
}) {
    const [form, setForm] = useState({
        theme: "system",
        timezone: "Asia/Kolkata",
        notifications: {}
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setForm({
            theme: profile?.preferences?.theme || "system",
            timezone: profile?.preferences?.timezone || "Asia/Kolkata",
            notifications: {
                taskAssigned:
                    profile?.preferences?.notifications?.taskAssigned ?? true,
                taskStatusChanged:
                    profile?.preferences?.notifications?.taskStatusChanged ?? true,
                comments:
                    profile?.preferences?.notifications?.comments ?? true,
                projectInvites:
                    profile?.preferences?.notifications?.projectInvites ?? true
            }
        });
    }, [profile]);

    const save = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const updated = await settingsService.updatePreferences(form);

            onUpdated(updated);
            setMessage("Preferences saved successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to save preferences."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={save}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div>
                <h2 className="text-lg font-bold text-slate-900">
                    Account Preferences
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Personalize your workspace.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Theme Preference
                    </label>

                    <select
                        value={form.theme}
                        onChange={(event) =>
                            setForm(previous => ({
                                ...previous,
                                theme: event.target.value
                            }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                        <option value="system">System Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Timezone
                    </label>

                    <select
                        value={form.timezone}
                        onChange={(event) =>
                            setForm(previous => ({
                                ...previous,
                                timezone: event.target.value
                            }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">London</option>
                        <option value="America/New_York">New York</option>
                        <option value="Asia/Dubai">Dubai</option>
                    </select>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-900">
                    Notification Preferences
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Choose which in-app notifications you want to receive.
                </p>

                <div className="mt-5 space-y-4">
                    {notificationOptions.map(([key, label]) => (
                        <label
                            key={key}
                            className="flex items-center justify-between gap-4"
                        >
                            <span className="text-sm font-medium text-slate-700">
                                {label}
                            </span>

                            <input
                                type="checkbox"
                                checked={form.notifications[key] ?? true}
                                onChange={(event) =>
                                    setForm(previous => ({
                                        ...previous,
                                        notifications: {
                                            ...previous.notifications,
                                            [key]: event.target.checked
                                        }
                                    }))
                                }
                                className="h-4 w-4 accent-indigo-600"
                            />
                        </label>
                    ))}
                </div>
            </div>

            {message && (
                <p role="status" className="text-sm text-slate-600">
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                <Save size={17} />
                {saving ? "Saving..." : "Save Preferences"}
            </button>
        </form>
    );
}