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
import { razorpayService } from "../services/razorpayService";
import { loadRazorpay } from "../utils/loadRazorpay";
import BillingHistory from "../components/billing/BillingHistory";

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
    const {
        activeWorkspace,
        loading: workspaceLoading
    } = useWorkspace();

    const [plans, setPlans] = useState([]);
    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    
    const [checkoutLoading, setCheckoutLoading] = useState(null);
    const [checkoutMessage, setCheckoutMessage] = useState("");
    const [testMode, setTestMode] = useState(false);

    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");


    useEffect(() => {
        if (!activeWorkspace?._id) {
            if (!workspaceLoading) {
                setLoading(false);
                setBilling(null);
            }
            return;
        }

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
                    setTestMode(false);
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
    }, [activeWorkspace?._id, workspaceLoading]);


    
    const startCheckout = async (planCode) => {
        try {
            setCheckoutLoading(planCode);
            setError("");
            setCheckoutMessage("");

            await loadRazorpay();

            const checkout = await razorpayService.createCheckout(
                planCode
            );

            setTestMode(Boolean(checkout.testMode));

            if (
                !checkout?.keyId ||
                !checkout?.subscriptionId ||
                typeof window.Razorpay !== "function"
            ) {
                throw new Error(
                    "Payment checkout is not configured correctly. Please contact the workspace owner."
                );
            }

            const options = {
                key: checkout.keyId,
                subscription_id: checkout.subscriptionId,
                name: "WorkFlowX",
                description: `${checkout.planName} Subscription`,
                ...(checkout.testMode
                    ? {
                        prefill: {
                            name: "Test User",
                            email: "success@razorpay.com",
                            contact: "9999999999"
                        },
                        notes: {
                            environment: "test"
                        }
                    }
                    : {}),

                handler: async (response) => {
                    try {
                        await razorpayService.verifyCheckout(response);

                        setCheckoutMessage(
                            "Authorization verified. Your plan will update after Razorpay confirms activation."
                        );

                        const latest =
                            await subscriptionService.getCurrent();

                        setBilling(latest);
                    } catch (error) {
                        setError(
                            error.response?.data?.message ||
                            "Unable to verify checkout"
                        );
                    } finally {
                        setCheckoutLoading(null);
                    }
                },

                modal: {
                    ondismiss: async () => {
                        try {
                            await razorpayService.cancelCheckout(
                                checkout.subscriptionId
                            );
                        } catch {
                            // The provider webhook can still resolve the checkout state.
                        }
                        setCheckoutLoading(null);
                    }
                },

                theme: {
                    color: "#4f46e5"
                }
            };

            const instance = new window.Razorpay(options);

            instance.on("payment.failed", (response) => {
                const paymentError = response.error || {};
                const description = paymentError.description || "";
                const code = paymentError.code || paymentError.reason || "";

                setError(
                    code
                        ? `Razorpay payment failed (${code}): ${description || "Payment authorization failed"}`
                        : /recurring/i.test(description)
                            ? "આ card recurring subscription માટે eligible નથી. Razorpay Test Modeમાં subscription test card 4718 6091 0820 4366 વાપરો."
                            : description || "Payment authorization failed"
                );
                razorpayService.cancelCheckout(checkout.subscriptionId)
                    .catch((cancelError) => {
                        console.error(
                            "Unable to cancel failed Razorpay checkout",
                            cancelError
                        );
                    });
                setCheckoutLoading(null);
            });

            instance.open();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to start checkout"
            );
            setCheckoutLoading(null);
        }
    };

    const handleCancelSubscription = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel auto-renewal for this workspace?"
        );

        if (!confirmed) return;

        try {
            setCancelLoading(true);
            setCancelMessage("");
            setError("");

            const result = await subscriptionService.cancel(true);

            setCancelMessage(
                result.message || "Cancellation request submitted."
            );

            const latest = await subscriptionService.getCurrent();
            setBilling(latest);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to cancel subscription"
            );
        } finally {
            setCancelLoading(false);
        }
    };


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

    if (!billing) {
        return (
            <p className="rounded-xl bg-amber-50 p-5 text-amber-800">
                No active workspace is available. Create or select a workspace
                and try again.
            </p>
        );
    }

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

                    {subscription.provider === "razorpay" &&
                        subscription.status === "active" &&
                        !subscription.cancelAtPeriodEnd && (
                            <button
                                type="button"
                                onClick={handleCancelSubscription}
                                disabled={cancelLoading}
                                className="mt-5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                {cancelLoading
                                    ? "Processing..."
                                    : "Cancel Subscription"}
                            </button>
                        )}

                    {subscription.cancelAtPeriodEnd && (
                        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                            Auto-renewal cancellation requested. Your paid access
                            remains subject to the confirmed billing end date.
                        </p>
                    )}

                    {cancelMessage && (
                        <p
                            role="status"
                            className="mt-3 text-sm text-indigo-600"
                        >
                            {cancelMessage}
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

                {testMode && (
                    <p className="mb-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                        Test Mode: recurring subscription માટે card
                        <strong className="mx-1">
                            4718 6091 0820 4366
                        </strong>
                        વાપરો. Expiry future date અને કોઈપણ CVV નાખો.
                    </p>
                )}

                {checkoutMessage && (
                    <p
                        role="status"
                        className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700"
                    >
                        {checkoutMessage}
                    </p>
                )}

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
                                    disabled={
                                        selected ||
                                        plan.code === "free" ||
                                        checkoutLoading !== null ||
                                        subscription.provider === "razorpay"
                                    }
                                    onClick={() => startCheckout(plan.code)}
                                    className={`mt-7 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
                                        selected
                                            ? "bg-slate-100 text-slate-500"
                                            : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                    }`}
                                >
                                    {selected
                                        ? "Current Plan"
                                        : checkoutLoading === plan.code
                                            ? "Opening Checkout..."
                                            : plan.code === "free"
                                                ? "Free Plan"
                                                : subscription.provider === "razorpay"
                                                    ? "Plan Change Coming Soon"
                                                    : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <BillingHistory />

        </div>
    );
}