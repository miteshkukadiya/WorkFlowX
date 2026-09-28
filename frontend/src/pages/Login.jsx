import { ArrowRight, LockKeyhole } from "lucide-react";

import {useState} from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";



const Login = () => {

    const navigate = useNavigate();

    const {
        login
    } = useAuth();

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


    setFormData((previous) => ({

            ...previous,

            [name]: value

        }));

    };

    const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");

    setLoading(true);

    try {

        const user = await login(
            formData.email,
            formData.password
        );

        console.log("Logged in user:", user);

        navigate("/", {
            replace: true
        });

    } catch (error) {

        console.error("Login failed:", error);

        const message =
            error.response?.data?.message ||
            error.message ||
            "Unable to login. Please try again.";

        setError(message);

    } finally {

        setLoading(false);

    }
};

    return (
        <div className="min-h-screen bg-slate-950 [background-image:radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.16),transparent_32rem)]">

            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Branding */}

                <div className="hidden flex-col justify-between p-10 lg:flex">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-900">
                            W
                        </div>

                        <span className="text-lg font-bold text-white">
                            WorkFlowX
                        </span>

                    </div>

                    <div className="max-w-lg">

                        <p className="mb-4 text-sm font-semibold text-slate-400">
                            PROJECT MANAGEMENT FOR MODERN TEAMS
                        </p>

                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                            Turn projects into
                            <span className="text-slate-400">
                                {" "}progress.
                            </span>
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-400">
                            Plan projects, manage tasks, track time,
                            and keep your entire team aligned in one workspace.
                        </p>

                    </div>

                    <p className="text-sm text-slate-500">
                        © 2026 WorkFlowX
                    </p>

                </div>


                {/* Login */}

                <div className="flex items-center justify-center bg-slate-50 px-4 py-8 sm:p-6">

                    <div className="w-full max-w-md">

                        <div className="mb-8 lg:hidden">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                                    W
                                </div>

                                <span className="text-lg font-bold text-slate-900">
                                    WorkFlowX
                                </span>

                            </div>

                        </div>


                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">

                            <div className="mb-8">

                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <LockKeyhole size={20} />
                                </div>

                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Welcome back
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    Sign in to continue to your workspace.
                                </p>

                            </div>

                            {/* Error */}

                            {error && (

                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                    {error}

                                </div> 

                            )}



                            <form className="space-y-5" onSubmit={handleSubmit}>

                                <div>

                                    <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <input
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        required
                                    />

                                </div>


                                <div>

                                    <div className="mb-2 flex justify-between">

                                        <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                                            Password
                                        </label>

                                        <button
                                            type="button"
                                            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                                        >
                                            Forgot password?
                                        </button>

                                    </div>

                                    <input
                                        id="login-password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        required
                                    />


                                </div>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    {loading
                                        ? "Signing in..."
                                        : "Sign in"
                                    }





                                     {!loading && (
                                        <ArrowRight size={17} />
                                    )}

                                </button>

                            </form>


                            <p className="mt-7 text-center text-sm text-slate-500">

                                Don't have an account?{" "}

                                <Link
                                    to="/register"
                                    className="font-semibold text-slate-900 hover:underline"
                                >
                                    Create one
                                </Link>

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;