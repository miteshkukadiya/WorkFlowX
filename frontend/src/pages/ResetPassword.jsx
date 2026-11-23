import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async event => {
        event.preventDefault();
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await authService.resetPassword(params.get("token"), password);
            navigate("/login", { replace: true, state: { message: "Password reset successfully. Please sign in." } });
        } catch (err) {
            setError(err.response?.data?.message || "Unable to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
                <p className="mt-2 text-sm text-slate-500">Use at least 6 characters.</p>
                <input type="password" required minLength={6} value={password} onChange={event => setPassword(event.target.value)} className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="New password" />
                <input type="password" required minLength={6} value={confirm} onChange={event => setConfirm(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Confirm password" />
                {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
                <button disabled={loading} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Resetting..." : "Reset password"}</button>
                <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-indigo-600">Back to login</Link>
            </form>
        </div>
    );
}
