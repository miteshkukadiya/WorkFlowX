import { useEffect, useState } from "react";
import { Camera, Save, UserRound } from "lucide-react";
import { settingsService } from "../../services/settingsService";

export default function ProfileSettings({
    profile,
    onUpdated
}) {
    const [form, setForm] = useState({
        name: "",
        bio: ""
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setForm({
            name: profile?.name || "",
            bio: profile?.bio || ""
        });
    }, [profile]);

    const saveProfile = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const updated = await settingsService.updateProfile(form);
            onUpdated(updated);
            setMessage("Profile updated successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const uploadImage = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (
            !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
            file.size > 2 * 1024 * 1024
        ) {
            setMessage("Select a JPG, PNG or WEBP image under 2 MB.");
            event.target.value = "";
            return;
        }

        try {
            setUploading(true);
            setMessage("");

            const updated = await settingsService.uploadAvatar(file);
            onUpdated(updated);
            setMessage("Profile photo updated.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to upload image."
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const avatarUrl = profile?.avatar
        ? `${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}${profile.avatar}`
        : null;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
                Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Update your profile details and photo.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-600">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Profile avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserRound size={34} />
                    )}
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                    <Camera size={17} />
                    {uploading ? "Uploading..." : "Change Photo"}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={uploadImage}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>

                <span className="text-xs text-slate-400">
                    JPG, PNG or WEBP · Maximum 2 MB
                </span>
            </div>

            <form onSubmit={saveProfile} className="mt-7 space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full Name
                    </label>

                    <input
                        value={form.name}
                        onChange={(event) =>
                            setForm(previous => ({
                                ...previous,
                                name: event.target.value
                            }))
                        }
                        required
                        minLength={2}
                        maxLength={80}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email Address
                    </label>

                    <input
                        value={profile?.email || ""}
                        disabled
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                        Email changes are not supported in this version.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Bio
                    </label>

                    <textarea
                        value={form.bio}
                        onChange={(event) =>
                            setForm(previous => ({
                                ...previous,
                                bio: event.target.value
                            }))
                        }
                        maxLength={300}
                        rows={4}
                        placeholder="Tell your team about yourself..."
                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                        {form.bio.length}/300
                    </p>
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
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}