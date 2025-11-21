import React, { useMemo, useState, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

const php = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
});

export default function FinalizeTransaction({ deal, agents = [], postUrl }) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const property = deal?.property_listing?.property || null;

    const [quickAction, setQuickAction] = useState(null);
    const [pricingMode, setPricingMode] = useState(() =>
        property?.property_type?.toLowerCase().includes("land") ? "simple" : "full"
    );

    const baseFromProperty = Number(property?.price || 0);
    const discountFromDeal =
        deal?.amount && baseFromProperty > 0
            ? Math.max(baseFromProperty - Number(deal.amount), 0)
            : 0;

    const initial = useMemo(() => {
        const basePrice = baseFromProperty || Number(deal?.amount ?? 0);
        const discount = discountFromDeal || 0;
        return {
            inquiry_id: null,
            property_id: property?.id ?? null,
            deal_id: deal?.id ?? null,
            buyer_id: deal?.buyer?.id ?? null,
            primary_agent_id: deal?.property_listing?.agents?.[0]?.id ?? null,
            status: "DRAFT",
            reserved_at: null,
            booked_at: null,
            closed_at: null,
            cancelled_at: null,
            cancel_reason: "",
            expires_at: null,
            base_price: basePrice,
            discount_amount: discount,
            fees_amount: 0,
            tcp: 0,
            reservation_amount: 0,
            downpayment_amount: 0,
            balance_amount: 0,
            financing: "cash",
            mode_of_payment: "",
            payment_terms_json: JSON.stringify({ months: 12, interest_rate: 0 }),
            reference_no: "",
            remarks: deal?.notes ?? "",
        };
    }, [deal]);

    const { data, setData, post, processing, errors, reset } = useForm(initial);

    const tcp = useMemo(() => {
        const b = Number(data.base_price || 0);
        const d = Number(data.discount_amount || 0);
        const f = Number(data.fees_amount || 0);
        return pricingMode === "simple" ? Math.max(b - d, 0) : Math.max(b - d + f, 0);
    }, [pricingMode, data.base_price, data.discount_amount, data.fees_amount]);

    const balance = useMemo(() => {
        const res = Number(data.reservation_amount || 0);
        const dp = Number(data.downpayment_amount || 0);
        return Math.max(tcp - res - dp, 0);
    }, [tcp, data.reservation_amount, data.downpayment_amount]);

    useEffect(() => setData("tcp", tcp), [tcp]);

    const onSubmit = (e) => {
        e.preventDefault();
        post(`/agents/deal/${deal.id}/finalize-deal`, { preserveScroll: true });
    };

    const setStatus = (status) => {
        setData("status", status);
        setQuickAction(status);
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        if (status === "RESERVED") setData("reserved_at", now);
        if (status === "BOOKED") setData("booked_at", now);
        if (status === "SOLD") setData("closed_at", now);
        if (status === "CANCELLED") setData("cancelled_at", now);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Finalize Transaction • Deal #${deal?.id}`} />

            <div className="page-container">
                {/* HEADER */}
                <header className="page-header">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 gradient-text">Finalize Transaction</h1>
                            <p className="section-description">
                                Deal #{deal?.id} — Buyer: {deal?.buyer?.name}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/agent/deals"
                                className="btn btn-outline btn-sm"
                            >
                                Back to Deals
                            </Link>
                            <button
                                onClick={onSubmit}
                                disabled={processing}
                                className="btn btn-primary btn-sm"
                            >
                                {processing ? "Saving…" : "Save Transaction"}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="page-content">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* SUMMARY SIDEBAR */}
                        <aside className="space-y-6">
                            <Card title="Deal Summary">
                                <KVP label="Deal ID" value={`#${deal?.id}`} />
                                <KVP label="Deal Status" value={deal?.status} />
                                <KVP
                                    label="Offer Amount"
                                    value={php.format(Number(deal?.amount || 0))}
                                />
                            </Card>

                            {/* Buyer */}
                            <Card title="Buyer Information">
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col text-sm">
                                        <span className="font-semibold text-gray-900">{deal?.buyer?.name}</span>
                                        <span className="text-gray-600">{deal?.buyer?.email}</span>
                                        {deal?.buyer?.contact_number && (
                                            <span className="text-gray-600 mt-1">
                                                📞 {deal?.buyer?.contact_number}
                                            </span>
                                        )}
                                        {deal?.buyer?.address && (
                                            <span className="text-gray-600">
                                                📍 {deal?.buyer?.address}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Property */}
                            <Card title="Property Details">
                                {property ? (
                                    <div className="flex items-start gap-3">
                                        {property.image_url && (
                                            <img
                                                src={`/${property.image_url}`}
                                                alt={property.title}
                                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                            />
                                        )}
                                        <div className="flex-1 text-sm">
                                            <p className="font-semibold text-gray-900">{property?.title}</p>
                                            <p className="text-gray-600">{property?.address}</p>
                                            <p className="text-gray-600">
                                                Type: {property?.property_type} — {property?.sub_type}
                                            </p>
                                            <p className="text-primary-600 font-semibold mt-1">
                                                {php.format(Number(property?.price || 0))}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No property linked to this deal.
                                    </p>
                                )}
                            </Card>
                        </aside>

                        {/* FORM SECTION */}
                        <section className="lg:col-span-2 space-y-6">
                            <form onSubmit={onSubmit} className="space-y-6">
                                {/* Lifecycle */}
                                <Card title="Transaction Lifecycle">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {["RESERVED", "BOOKED", "SOLD", "CANCELLED"].map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setStatus(val)}
                                                className={cn(
                                                    "btn btn-sm",
                                                    data.status === val ? "btn-primary" : "btn-outline"
                                                )}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Status" error={errors.status}>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData("status", e.target.value)}
                                                className="form-select"
                                            >
                                                {[
                                                    "DRAFT",
                                                    "RESERVED",
                                                    "BOOKED",
                                                    "SOLD",
                                                    "CANCELLED",
                                                    "EXPIRED",
                                                    "REFUNDED",
                                                ].map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label="Primary Agent" error={errors.primary_agent_id}>
                                            <select
                                                value={data.primary_agent_id || ""}
                                                onChange={(e) =>
                                                    setData("primary_agent_id", e.target.value || null)
                                                }
                                                className="form-select"
                                            >
                                                <option value="">— Select Agent —</option>
                                                {agents.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                </Card>

                                {/* Commercials */}
                                <Card title="Financial Details">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-700">Pricing Mode</span>
                                        <div className="flex gap-4 text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="pricing_mode"
                                                    value="full"
                                                    checked={pricingMode === "full"}
                                                    onChange={() => setPricingMode("full")}
                                                    className="form-radio"
                                                />
                                                Full Pricing
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="pricing_mode"
                                                    value="simple"
                                                    checked={pricingMode === "simple"}
                                                    onChange={() => setPricingMode("simple")}
                                                    className="form-radio"
                                                />
                                                Simple Pricing
                                            </label>
                                        </div>
                                    </div>

                                    {pricingMode === "simple" ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <MoneyField
                                                label="Base Price"
                                                value={data.base_price}
                                                onChange={(v) => setData("base_price", v)}
                                                error={errors.base_price}
                                            />
                                            <MoneyField
                                                label="Discount"
                                                value={data.discount_amount}
                                                onChange={(v) => setData("discount_amount", v)}
                                                error={errors.discount_amount}
                                            />
                                            <ReadOnlyField
                                                label="Total Contract Price"
                                                value={php.format(tcp)}
                                                highlight
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <MoneyField
                                                    label="Base Price"
                                                    value={data.base_price}
                                                    onChange={(v) => setData("base_price", v)}
                                                    error={errors.base_price}
                                                />
                                                <MoneyField
                                                    label="Discount"
                                                    value={data.discount_amount}
                                                    onChange={(v) => setData("discount_amount", v)}
                                                    error={errors.discount_amount}
                                                />
                                                <MoneyField
                                                    label="Additional Fees"
                                                    value={data.fees_amount}
                                                    onChange={(v) => setData("fees_amount", v)}
                                                    error={errors.fees_amount}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <ReadOnlyField
                                                    label="Total Contract Price"
                                                    value={php.format(tcp)}
                                                    highlight
                                                />
                                                <MoneyField
                                                    label="Reservation Amount"
                                                    value={data.reservation_amount}
                                                    onChange={(v) => setData("reservation_amount", v)}
                                                    error={errors.reservation_amount}
                                                />
                                                <MoneyField
                                                    label="Downpayment Amount"
                                                    value={data.downpayment_amount}
                                                    onChange={(v) => setData("downpayment_amount", v)}
                                                    error={errors.downpayment_amount}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <ReadOnlyField
                                                    label="Balance Due"
                                                    value={php.format(balance)}
                                                    highlight={balance > 0}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {/* Terms */}
                                <Card title="Payment Terms">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Financing Type" error={errors.financing}>
                                            <select
                                                value={data.financing || "cash"}
                                                onChange={(e) => setData("financing", e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank">Bank Financing</option>
                                                <option value="in_house">In-House</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </Field>

                                        <Field label="Payment Method" error={errors.mode_of_payment}>
                                            <select
                                                value={data.mode_of_payment || ""}
                                                onChange={(e) =>
                                                    setData("mode_of_payment", e.target.value)
                                                }
                                                className="form-select"
                                            >
                                                <option value="">— Select Method —</option>
                                                <option value="cash">Cash</option>
                                                <option value="check">Check</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="gcash">GCash</option>
                                                <option value="paymaya">PayMaya</option>
                                                <option value="others">Others</option>
                                            </select>
                                        </Field>

                                        <Field label="Reference Number" error={errors.reference_no}>
                                            <input
                                                type="text"
                                                value={data.reference_no || ""}
                                                onChange={(e) =>
                                                    setData("reference_no", e.target.value)
                                                }
                                                className="form-input"
                                                placeholder="e.g., OR#, Bank Ref"
                                            />
                                        </Field>
                                    </div>
                                </Card>

                                {/* Notes */}
                                <Card title="Additional Remarks">
                                    <div className="form-group">
                                        <textarea
                                            value={data.remarks || ""}
                                            onChange={(e) => setData("remarks", e.target.value)}
                                            className="form-textarea"
                                            rows={4}
                                            placeholder="Additional remarks, special conditions, or notes about this transaction..."
                                        />
                                        {errors.remarks && (
                                            <p className="form-error">{errors.remarks}</p>
                                        )}
                                    </div>
                                </Card>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Link
                                        href="/agent/deals"
                                        className="btn btn-outline btn-sm"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn btn-primary btn-sm"
                                    >
                                        {processing ? "Saving…" : "Save Transaction"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ---------------- HELPER COMPONENTS ---------------- */

const cn = (...classes) => classes.filter(Boolean).join(' ');

function Card({ title, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
        >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
            {children}
        </motion.div>
    );
}

function KVP({ label, value }) {
    return (
        <div className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-600 font-medium">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {children}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

function MoneyField({ label, value, onChange, error }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₱</span>
                <input
                    type="number"
                    value={value || 0}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="form-input pl-8"
                />
            </div>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

function ReadOnlyField({ label, value, highlight }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className={cn(
                "gray-card p-3",
                highlight && "bg-primary-50 border-primary-200"
            )}>
                <span className={cn(
                    "text-sm font-semibold",
                    highlight ? "text-primary-700" : "text-gray-900"
                )}>
                    {value}
                </span>
            </div>
        </div>
    );
}
