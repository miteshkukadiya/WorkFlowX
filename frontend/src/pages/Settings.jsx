import { useEffect, useState } from "react";
import {
    UserRound,
    ShieldCheck,
    SlidersHorizontal
} from "lucide-react";

import { settingsService } from "../services/settingsService";

import ProfileSettings from "../components/settings/ProfileSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import PreferencesSettings from "../components/settings/PreferencesSettings";

const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "preferences", label: "Preferences", icon: SlidersHorizontal }
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const data = await settingsService.getProfile();

                if (active) {
                    setProfile(data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load settings."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="py-20 text-center text-sm text-slate-500">
                Loading account settings...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl bg-red-50 p-5 text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage your profile, security and preferences.
                </p>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                            activeTab === id
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Icon size={17} />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === "profile" && (
                <ProfileSettings
                    profile={profile}
                    onUpdated={setProfile}
                />
            )}

            {activeTab === "security" && (
                <SecuritySettings />
            )}

            {activeTab === "preferences" && (
                <PreferencesSettings
                    profile={profile}
                    onUpdated={setProfile}
                />
            )}
        </div>
    );
}