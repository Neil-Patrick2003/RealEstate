import React, { useMemo, useState, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";

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
        <BrokerLayout >
            <Head title={`Finalize Transaction • Deal #${deal?.id}`} />

            {/* HEADER */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Finalize Transaction</h1>
                        <p className="text-sm text-gray-500">
                            Deal #{deal?.id} — Buyer: {deal?.buyer?.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/broker/deals"
                            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                        >
                            Back
                        </Link>
                        <button
                            onClick={onSubmit}
                            disabled={processing}
                            className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {processing ? "Saving…" : "Save Transaction"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="x-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SUMMARY */}
                <aside className="space-y-4">
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
                                <span className="font-medium">{deal?.buyer?.name}</span>
                                <span className="text-gray-600">{deal?.buyer?.email}</span>
                                {deal?.buyer?.contact_number && (
                                    <span className="text-gray-600">
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
                                        className="w-20 h-20 rounded-lg object-cover border"
                                    />
                                )}
                                <div className="flex-1 text-sm">
                                    <p className="font-medium">{property?.title}</p>
                                    <p className="text-gray-600">{property?.address}</p>
                                    <p className="text-gray-600">
                                        Type: {property?.property_type} —{" "}
                                        {property?.sub_type}
                                    </p>
                                    <p className="text-gray-700 font-medium mt-1">
                                        {php.format(Number(property?.price || 0))}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">
                                No property linked to this deal.
                            </p>
                        )}
                    </Card>
                </aside>

                {/* FORM */}
                <section className="lg:col-span-2 space-y-6">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Lifecycle */}
                        <Card title="Lifecycle">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {["RESERVED", "BOOKED", "SOLD", "CANCELLED"].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setStatus(val)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border ${
                                            data.status === val
                                                ? "bg-black text-white"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Status" error={errors.status}>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                        className="w-full rounded-lg border-gray-300"
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
                                        className="w-full rounded-lg border-gray-300"
                                    >
                                        <option value="">— Select —</option>
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
                        {/* COMMERCIALS */}
                        <Card title="Commercials">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-600">Pricing Mode</span>
                                <div className="flex gap-3 text-xs">
                                    <label>
                                        <input
                                            type="radio"
                                            name="pricing_mode"
                                            value="full"
                                            checked={pricingMode === "full"}
                                            onChange={() => setPricingMode("full")}
                                        />{" "}
                                        Full
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="pricing_mode"
                                            value="simple"
                                            checked={pricingMode === "simple"}
                                            onChange={() => setPricingMode("simple")}
                                        />{" "}
                                        Simple
                                    </label>
                                </div>
                            </div>

                            {pricingMode === "simple" ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <MoneyField
                                        label="Base Price"
                                        value={data.base_price}
                                        onChange={(v) => setData("base_price", v)}
                                    />
                                    <MoneyField
                                        label="Discount"
                                        value={data.discount_amount}
                                        onChange={(v) => setData("discount_amount", v)}
                                    />
                                    <ReadOnlyField label="TCP" value={php.format(tcp)} highlight />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <MoneyField
                                            label="Base Price"
                                            value={data.base_price}
                                            onChange={(v) => setData("base_price", v)}
                                        />
                                        <MoneyField
                                            label="Discount"
                                            value={data.discount_amount}
                                            onChange={(v) => setData("discount_amount", v)}
                                        />
                                        <MoneyField
                                            label="Fees"
                                            value={data.fees_amount}
                                            onChange={(v) => setData("fees_amount", v)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <ReadOnlyField label="TCP" value={php.format(tcp)} highlight />
                                        <MoneyField
                                            label="Reservation (optional)"
                                            value={data.reservation_amount}
                                            onChange={(v) => setData("reservation_amount", v)}
                                        />
                                        <MoneyField
                                            label="Downpayment (optional)"
                                            value={data.downpayment_amount}
                                            onChange={(v) => setData("downpayment_amount", v)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <ReadOnlyField
                                            label="Balance (auto-calculated)"
                                            value={php.format(balance)}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>


                        {/* Terms */}
                        <Card title="Terms">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Field label="Financing">
                                    <select
                                        value={data.financing || "cash"}
                                        onChange={(e) => setData("financing", e.target.value)}
                                        className="w-full rounded-lg border-gray-300"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                        <option value="in_house">In-House</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>

                                <Field label="Mode of Payment">
                                    <select
                                        value={data.mode_of_payment || ""}
                                        onChange={(e) =>
                                            setData("mode_of_payment", e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300"
                                    >
                                        <option value="">— Select —</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="gcash">GCash</option>
                                        <option value="paymaya">PayMaya</option>
                                        <option value="others">Others</option>
                                    </select>
                                </Field>

                                <Field label="Reference No.">
                                    <input
                                        type="text"
                                        value={data.reference_no || ""}
                                        onChange={(e) =>
                                            setData("reference_no", e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 px-2 py-2"
                                        placeholder="e.g., OR#, Bank Ref"
                                    />
                                </Field>
                            </div>
                        </Card>

                        {/* Notes */}
                        <Card title="Notes">
                            <textarea
                                value={data.remarks || ""}
                                onChange={(e) => setData("remarks", e.target.value)}
                                className="w-full rounded-lg border-gray-300 min-h-[120px]"
                                placeholder="Additional remarks..."
                            />
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link
                                href="/agent/deals"
                                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {processing ? "Saving…" : "Save Transaction"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </BrokerLayout>
    );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Card({ title, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border p-4"
        >
            <h2 className="text-base font-medium mb-3">{title}</h2>
            {children}
        </motion.div>
    );
}

function KVP({ label, value }) {
    return (
        <div className="flex justify-between text-sm py-0.5">
            <span className="text-gray-600">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

function MoneyField({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            <input
                type="number"
                value={value || 0}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full rounded-lg border-gray-300 px-2 py-2"
            />
        </div>
    );
}

function ReadOnlyField({ label, value, highlight }) {
    return (
        <div>
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            <div
                className={`w-full px-3 py-2 rounded-lg border ${
                    highlight ? "border-black bg-gray-50" : "border-gray-300 bg-gray-50"
                }`}
            >
                <span className="text-sm">{value}</span>
            </div>
        </div>
    );
}
