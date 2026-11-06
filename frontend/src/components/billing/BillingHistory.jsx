import { useEffect, useState } from "react";
import { Receipt, CreditCard, ExternalLink } from "lucide-react";

import { subscriptionService } from "../../services/subscriptionService";

const formatAmount = (amount, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency
    }).format(amount / 100);

export default function BillingHistory({ refreshKey = 0 }) {
    const [history, setHistory] = useState({
        payments: [],
        invoices: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await subscriptionService.getHistory();

                if (!cancelled) setHistory(data);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load billing history"
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
    }, [refreshKey]);

    if (loading) return <p>Loading billing history...</p>;

    if (error) {
        return <p role="alert" className="text-red-600">{error}</p>;
    }

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b p-5">
                    <CreditCard className="text-indigo-600" />
                    <h2 className="font-bold">Payment History</h2>
                </div>

                {history.payments.length === 0 ? (
                    <p className="p-6 text-sm text-slate-500">
                        No payments recorded yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-4">Payment ID</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.payments.map(payment => (
                                    <tr
                                        key={payment._id}
                                        className="border-t"
                                    >
                                        <td className="p-4 font-mono text-xs">
                                            {payment.razorpayPaymentId}
                                        </td>
                                        <td className="p-4 font-semibold">
                                            {formatAmount(
                                                payment.amount,
                                                payment.currency
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {new Date(
                                                payment.paidAt ||
                                                payment.createdAt
                                            ).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="p-4 capitalize">
                                            {payment.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b p-5">
                    <Receipt className="text-indigo-600" />
                    <h2 className="font-bold">Invoice History</h2>
                </div>

                {history.invoices.length === 0 ? (
                    <p className="p-6 text-sm text-slate-500">
                        No invoices recorded yet.
                    </p>
                ) : (
                    <div className="divide-y">
                        {history.invoices.map(invoice => (
                            <div
                                key={invoice._id}
                                className="flex flex-wrap items-center justify-between gap-3 p-5"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {invoice.invoiceNumber ||
                                            "Invoice"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(
                                            invoice.issuedAt
                                        ).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-semibold">
                                        {formatAmount(
                                            invoice.amount,
                                            invoice.currency
                                        )}
                                    </span>

                                    {invoice.invoiceUrl && (
                                        <a
                                            href={invoice.invoiceUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-600"
                                            aria-label="Open invoice"
                                        >
                                            <ExternalLink size={17} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}