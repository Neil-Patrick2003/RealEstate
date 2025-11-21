import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import TransactionReviewModal from "./TransactionReviewModal.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

// PHP Currency Formatter
const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });

export default function Index({ transactions, filters, totals }) {
    const [local, setLocal] = React.useState({
        status: filters.status || "",
        search: filters.search || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    const applyFilters = () => {
        router.get(route('agents.transaction.index'), local, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setLocal({ status: "", search: "", date_from: "", date_to: "" });
        router.get(route('agents.transaction.index'), {}, { preserveState: true, replace: true });
    };

    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedTx, setSelectedTx] = React.useState(null);

    function openReview(tx) {
        setSelectedTx(tx);
        setModalOpen(true);
    }

    return (
        <AuthenticatedLayout>
            <Head title="My Transactions" />

            <div className="page-container">
                <div className="page-content space-y-6">
                    <TransactionReviewModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        tx={selectedTx}
                    />

                    {/* Header */}
                    <div className="section">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 gradient-text">Transaction Manager</h1>
                                <p className="section-description">
                                    Track and manage all property transactions and sales.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Stat title="All" value={totals.all} />
                        <Stat title="Draft" value={totals.draft} />
                        <Stat title="Reserved" value={totals.reserved} />
                        <Stat title="Booked" value={totals.booked} />
                        <Stat
                            title="Total Contract Price"
                            value={php.format(totals.tcp_sum || 0)}
                            isPrimary={true}
                        />
                    </div>

                    {/* Filters Card */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Transactions</h3>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={local.status}
                                    onChange={(e) => setLocal((s) => ({ ...s, status: e.target.value }))}
                                >
                                    <option value="">All Statuses</option>
                                    {["DRAFT","RESERVED","BOOKED","SOLD","CANCELLED","EXPIRED","REFUNDED"].map(s=>(
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 form-group">
                                <label className="form-label">Search</label>
                                <input
                                    type="text"
                                    placeholder="Buyer, property, reference..."
                                    className="form-input"
                                    value={local.search}
                                    onChange={(e)=>setLocal(s=>({...s, search: e.target.value}))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">From Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={local.date_from}
                                    onChange={(e)=>setLocal(s=>({...s, date_from: e.target.value}))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">To Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={local.date_to}
                                    onChange={(e)=>setLocal(s=>({...s, date_to: e.target.value}))}
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 justify-end">
                            <button
                                onClick={resetFilters}
                                className="btn btn-outline btn-sm"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={applyFilters}
                                className="btn btn-primary btn-sm"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[800px]">
                                <thead className="bg-gray-50">
                                <tr className="text-left text-gray-500 uppercase tracking-wider text-xs">
                                    <Th>Created Date</Th>
                                    <Th>Buyer Details</Th>
                                    <Th>Property</Th>
                                    <Th>Status</Th>
                                    <Th className="text-right">TCP</Th>
                                    <Th className="text-right">Balance Due</Th>
                                    <Th className="text-right">Action</Th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500 font-medium">
                                            No transactions matching the current filters were found.
                                        </td>
                                    </tr>
                                )}

                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <Td className="text-gray-600">
                                            {new Date(t.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{t.buyer?.name || "-"}</span>
                                                <span className="text-gray-500 text-xs">{t.buyer?.email || "No Email"}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">
                                                    {t.property?.title || `#${t.property_id || "N/A"}`}
                                                </span>
                                                <span className="text-gray-500 text-xs">{t.property?.address}</span>
                                            </div>
                                        </Td>
                                        <Td><StatusPill value={t.status} /></Td>
                                        <Td className="text-right font-semibold text-gray-800">
                                            {php.format(Number(t.tcp || 0))}
                                        </Td>
                                        <Td className="text-right font-bold text-red-600">
                                            {php.format(Number(t.balance_amount || 0))}
                                        </Td>
                                        <Td className="text-right">
                                            {t ? (
                                                <button
                                                    onClick={() => openReview(t)}
                                                    className="btn btn-primary btn-sm"
                                                    type="button"
                                                >
                                                    Review
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </Td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 1 && (
                        <Pagination meta={transactions} />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// --- Helper Components ---

function Th({ children, className = "" }) {
    return (
        <th className={`p-4 text-xs font-bold uppercase tracking-wider ${className}`}>
            {children}
        </th>
    );
}

function Td({ children, className = "" }) {
    return (
        <td className={`p-4 border-b border-gray-100 ${className}`}>
            {children}
        </td>
    );
}

// Stat component
function Stat({ title, value, isPrimary = false }) {
    return (
        <div className={`card p-4 text-center transition duration-150 ${
            isPrimary ? "bg-primary-50 border-primary-200" : ""
        }`}>
            <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-2">
                {title}
            </div>
            <div className={`text-xl font-bold ${
                isPrimary ? "text-primary-700" : "text-gray-900"
            }`}>
                {value}
            </div>
        </div>
    );
}

// StatusPill component
function StatusPill({ value }) {
    const statusMap = {
        DRAFT: "badge-gray",
        RESERVED: "badge-warning",
        BOOKED: "badge-primary",
        SOLD: "badge-success",
        CANCELLED: "badge-error",
        EXPIRED: "badge-gray",
        REFUNDED: "badge-primary",
    };

    return (
        <span className={`badge ${statusMap[value] || statusMap.DRAFT}`}>
            {value}
        </span>
    );
}

// Pagination component
function Pagination({ meta }) {
    if (!meta?.links) return null;

    return (
        <div className="flex flex-wrap gap-2 items-center justify-center">
            {meta.links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || "#"}
                    className={`btn btn-sm ${
                        link.active ? "btn-primary" : "btn-outline"
                    } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
