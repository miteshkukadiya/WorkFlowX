import { useEffect, useState } from "react";
import {
    CreditCard,
    Check,
    Crown,
    FolderKanban,
    Users   
} from "lucide-react";

import { subscriptionService } from "../services/subscriptionService";
import { useWorkspace } from "../context/WorkspaceContext";

function UsageBar({ label, current, max, icon: Icon }) {
    const unlimited = max === -1;

    const percentage = unlimited
        ? 0
        : max > 0
            ? Math.min(100, (current / max) * 100)
            : 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                    <Icon size={16} />
                    {label}
                </span>

                <span className="font-semibold text-slate-800">
                    {current} / {unlimited ? "Unlimited" : max}
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default function Billing() {
    const { activeWorkspace } = useWorkspace();

    const [plans, setPlans] = useState([]);
    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!activeWorkspace?._id) return;

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                setBilling(null);

                const [planData, billingData] = await Promise.all([
                    subscriptionService.getPlans(),
                    subscriptionService.getCurrent()
                ]);

                if (!cancelled) {
                    setPlans(planData);
                    setBilling(billingData);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load billing information"
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
    }, [activeWorkspace?._id]);

    if (loading) {
        return (
            <div className="p-8 text-slate-500">
                Loading subscription information...
            </div>
        );
    }

    if (error) {
        return (
            <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
                {error}
            </p>
        );
    }

    if (!billing) return null;

    const { subscription, usage } = billing;
    const currentPlan = subscription.plan;

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-10">
            <div>
                <div className="flex items-center gap-3">
                    <CreditCard className="text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900">
                        Subscription & Billing
                    </h1>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                    Manage the subscription for {activeWorkspace?.name}.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Crown size={20} className="text-indigo-600" />
                        <h2 className="font-bold">Current Plan</h2>
                    </div>

                    <p className="text-3xl font-bold text-slate-900">
                        {currentPlan.name}
                    </p>

                    <p className="mt-2 text-sm capitalize text-slate-500">
                        Status: {subscription.status}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Access: {subscription.hasAccess ? "Active" : "Inactive"}
                    </p>

                    {subscription.currentPeriodEnd && (
                        <p className="mt-2 text-sm text-slate-500">
                            Current period ends:{" "}
                            {new Date(
                                subscription.currentPeriodEnd
                            ).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-bold">Workspace Usage</h2>

                    <UsageBar
                        label="Projects"
                        icon={FolderKanban}
                        current={usage.projects}
                        max={currentPlan.limits.maxProjects}
                    />

                    <UsageBar
                        label="Members & Reserved Seats"
                        icon={Users}
                        current={
                            usage.members + usage.pendingInvitations
                        }
                        max={currentPlan.limits.maxMembers}
                    />
                </div>
            </div>

            <div>
                <h2 className="mb-5 text-xl font-bold text-slate-900">
                    Available Plans
                </h2>

                <div className="grid gap-5 md:grid-cols-3">
                    {plans.map(plan => {
                        const selected =
                            plan._id === currentPlan._id;

                        return (
                            <div
                                key={plan._id}
                                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                                    selected
                                        ? "border-indigo-500"
                                        : "border-slate-200"
                                }`}
                            >
                                <h3 className="text-lg font-bold">
                                    {plan.name}
                                </h3>

                                <div className="mt-4">
                                    <span className="text-3xl font-bold">
                                        ₹{(plan.price / 100).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        /month
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <p className="flex items-center gap-2 text-sm">
                                        <Check size={16} className="text-green-600" />
                                        {plan.limits.maxProjects === -1
                                            ? "Unlimited projects"
                                            : `${plan.limits.maxProjects} projects`}
                                    </p>

                                    <p className="flex items-center gap-2 text-sm">
                                        <Check size={16} className="text-green-600" />
                                        {plan.limits.maxMembers} members
                                    </p>

                                    {plan.features.advancedReports && (
                                        <p className="flex items-center gap-2 text-sm">
                                            <Check size={16} className="text-green-600" />
                                            Advanced reports
                                        </p>
                                    )}

                                    {plan.features.timeTracking && (
                                        <p className="flex items-center gap-2 text-sm">
                                            <Check size={16} className="text-green-600" />
                                            Time tracking
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    disabled
                                    className="mt-7 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
                                >
                                    {selected
                                        ? "Current Plan"
                                        : "Checkout Coming in Day 26"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}