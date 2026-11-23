import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async event => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            await authService.forgotPassword(email);
            setMessage("If an account exists for this email, a reset link has been sent.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
                <p className="mt-2 text-sm text-slate-500">Enter your email and we will send a secure reset link.</p>
                <input type="email" required value={email} onChange={event => setEmail(event.target.value)} className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="you@company.com" />
                {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
                {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
                <button disabled={loading} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button>
                <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-indigo-600">Back to login</Link>
            </form>
        </div>
    );
}
