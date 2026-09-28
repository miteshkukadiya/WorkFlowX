import { Link , useNavigate} from "react-router-dom";

import { useState } from "react";

import { UserPlus } from "lucide-react";

import {useAuth} from "../context/AuthContext";



const Register = () => {

    const navigate = useNavigate();

    const { register } = useAuth();

    const [formData, setFormData] = useState({ name : "" , email: "", password: "" });

    const [error, setError] = useState("");

    const [success , setSuccess] = useState(false);

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

        setSuccess("");

        setLoading(true);


        try {

            await register(
                formData.name,
                formData.email,
                formData.password
            );


            setSuccess(
                "Account created successfully. Redirecting to login..."
            );


            setTimeout(() => {

                navigate("/login");

            }, 1200);


        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Unable to create account. Please try again.";

            setError(message);

        } finally {

            setLoading(false);

        }

    };



    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_28rem)]">

            <div className="w-full max-w-md">

                <div className="mb-8 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-900">
                        W
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-white">
                        Create your workspace account
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Start managing projects with WorkFlowX.
                    </p>

                </div>


                <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-9">

                     <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                        <UserPlus size={20} />

                    </div>

                    {/* Error */}

                    {error && (

                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                            {error}

                        </div>

                    )}

                     {/* Success */}

                    {success && (

                        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                            {success}

                        </div>

                    )}


                    <form  onSubmit={handleSubmit} className="space-y-5" >
                        

                        <div>

                            <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-slate-700">
                                Full name
                            </label>

                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                minLength={2}
                                placeholder="Mitesh Kukadiya"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                required
                            />

                        </div>


                        <div>

                            <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>

                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                required
                            />

                        </div>


                        <div>

                            <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>

                            <input
                                id="register-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                placeholder="Minimum 6 characters"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                 minLength={6}
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >


                            {loading
                                ? "Creating account..."
                                : "Create account"
                            }

                            
                        </button>

                    </form>


                    <p className="mt-6 text-center text-sm text-slate-500">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-slate-900 hover:underline"
                        >
                            Sign in
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
};

export default Register;