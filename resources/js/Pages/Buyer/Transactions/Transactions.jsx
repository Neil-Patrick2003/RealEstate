import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import Modal from "@/Components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileInvoice,
    faReceipt,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faMoneyBillWave,
    faSearch,
    faFilter,
    faCalendar,
    faPrint,
    faDownload,
    faEye,
    faChevronLeft,
    faChevronRight,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets/framer_logo.png";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import PageHeader from "@/Components/ui/PageHeader.jsx";
import StatsCard from "@/Components/ui/StatsCard.jsx";
import {
    faHome,
    faUser,
    faCalculator,
    faCreditCard,
    faChartBar,
    faStickyNote
} from "@fortawesome/free-solid-svg-icons";

// Helper for Philippine Peso formatting
const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });

export default function Index({ transactions, filters, totals }) {
    const [local, setLocal] = React.useState({
        status: filters.status || "",
        search: filters.search || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
        items_per_page: filters.items_per_page || 10,
    });

    const [open, setOpen] = React.useState(false);
    const [tx, setTx] = React.useState(null);
    const [activeStatusFilter, setActiveStatusFilter] = React.useState("All");

    // normalize + apply
    const normalize = (f) => {
        const out = {
            status: (f.status || "").trim(),
            search: (f.search || "").trim(),
            date_from: f.date_from || "",
            date_to: f.date_to || "",
            items_per_page: f.items_per_page || 10,
        };
        if (out.date_from && out.date_to && out.date_from > out.date_to) {
            const t = out.date_from; out.date_from = out.date_to; out.date_to = t;
        }
        Object.keys(out).forEach(k => { if (out[k] === "" || out[k] == null) delete out[k]; });
        return out;
    };

    const applyFilters = () => {
        router.get(route("buyer.transactions.index"), normalize(local), {
            preserveState: true, replace: true, preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setLocal({ status: "", search: "", date_from: "", date_to: "", items_per_page: 10 });
        setActiveStatusFilter("All");
        router.get(route("buyer.transactions.index"), {}, {
            preserveState: true, replace: true, preserveScroll: true,
        });
    };

    const openReview = (row) => { setTx(row); setOpen(true); };

    const handleStatusClick = (status) => {
        setLocal(s => ({ ...s, status: status === "All" ? "" : status }));
        setActiveStatusFilter(status);
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Transactions" />

            <div className="page-container">
                <div className="page-content">
                    {/* Header */}
                    <PageHeader
                        title="Transaction Management"
                        subtitle="Track and manage your property transactions, payments, and documents"
                        action={
                            <Link
                                href="/all-properties"
                                className="btn-primary"
                            >
                                <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
                                Browse Properties
                            </Link>
                        }
                    />

                    {/* Stats Overview */}
                    <div className="grid-cards mb-8">
                        <StatsCard
                            title="All Transactions"
                            value={totals.all}
                            subtitle="Total transactions"
                            icon={faFileInvoice}
                            color="primary"
                            onClick={() => handleStatusClick("All")}
                        />
                        <StatsCard
                            title="Active"
                            value={totals.reserved + totals.booked}
                            subtitle="Reserved & Booked"
                            icon={faClock}
                            color="warning"
                            onClick={() => handleStatusClick("RESERVED")}
                        />
                        <StatsCard
                            title="Completed"
                            value={totals.sold}
                            subtitle="Successfully sold"
                            icon={faCheckCircle}
                            color="accent"
                            onClick={() => handleStatusClick("SOLD")}
                        />
                        <StatsCard
                            title="Total Value"
                            value={php.format(totals.tcp_sum || 0)}
                            subtitle="Contract price sum"
                            icon={faMoneyBillWave}
                            color="secondary"
                        />
                    </div>

                    {/* Active Filter Indicator */}
                    {activeStatusFilter !== "All" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-600">Showing:</span>
                                <span className="badge-primary font-semibold">
                                    {activeStatusFilter} Transactions
                                </span>
                                <button
                                    onClick={() => handleStatusClick("All")}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Show All
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Search and Filter Bar */}
                    <div className="card p-6 mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                            {/* Search Input */}
                            <div className="lg:col-span-4">
                                <label className="form-label">
                                    Search Transactions
                                </label>
                                <div className="relative">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by property, reference..."
                                        value={local.search}
                                        onChange={(e) => setLocal(s => ({ ...s, search: e.target.value }))}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                                        className="form-input pl-12"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="lg:col-span-3">
                                <label className="form-label">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Status
                                </label>
                                <select
                                    value={local.status}
                                    onChange={(e) => {
                                        setLocal(s => ({ ...s, status: e.target.value }));
                                        setActiveStatusFilter(e.target.value || "All");
                                    }}
                                    className="form-select"
                                >
                                    <option value="">All Status</option>
                                    {["DRAFT", "RESERVED", "BOOKED", "SOLD", "CANCELLED", "EXPIRED", "REFUNDED"].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="lg:col-span-3">
                                <label className="form-label">
                                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                                    Date Range
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        aria-label="Date From"
                                        className="form-input text-sm"
                                        value={local.date_from}
                                        onChange={(e) => setLocal(s => ({ ...s, date_from: e.target.value }))}
                                    />
                                    <span className="text-gray-500 shrink-0">to</span>
                                    <input
                                        type="date"
                                        aria-label="Date To"
                                        className="form-input text-sm"
                                        value={local.date_to}
                                        onChange={(e) => setLocal(s => ({ ...s, date_to: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Items Per Page & Actions */}
                            <div className="lg:col-span-2 flex gap-2">
                                <div className="flex-1">
                                    <label className="form-label">Items / Page</label>
                                    <select
                                        className="form-select"
                                        value={local.items_per_page}
                                        onChange={(e) => setLocal(s => ({ ...s, items_per_page: Number(e.target.value) }))}
                                    >
                                        {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={applyFilters}
                                        className="btn-primary btn-sm"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={resetFilters}
                                        className="btn-outline btn-sm"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {transactions.data.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <AnimatePresence>
                                {transactions.data.map((t) => (
                                    <MobileTransactionCard key={t.id} t={t} openReview={openReview} php={php} />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Table View */}
                    <div className="hidden md:block">
                        {transactions.data.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="card overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-left text-gray-700">
                                        <Th>Date</Th>
                                        <Th>Property</Th>
                                        <Th>Status</Th>
                                        <Th className="text-right">TCP</Th>
                                        <Th className="text-right">Paid</Th>
                                        <Th className="text-right">Balance</Th>
                                        <Th className="text-right">Actions</Th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <AnimatePresence>
                                        {transactions.data.map((t) => (
                                            <TransactionRow key={t.id} t={t} openReview={openReview} php={php} />
                                        ))}
                                    </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {transactions.data.length > 0 && (
                        <Pagination meta={transactions} />
                    )}
                </div>
            </div>

            {/* Modal */}
            <BuyerTxModal open={open} onClose={() => setOpen(false)} tx={tx} />
        </AuthenticatedLayout>
    );
}

/* --- Enhanced Components --- */



function Th({ children, className = "" }) {
    return <th className={`p-4 text-xs font-bold uppercase tracking-wider text-gray-700 ${className}`}>{children}</th>;
}

function TransactionRow({ t, openReview, php }) {
    const paidAmount = Number((t.reservation_amount || 0) + (t.downpayment_amount || 0));

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
        >
            <td className="p-4 text-gray-600">
                {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
            <td className="p-4">
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 line-clamp-1">{t.property?.title || `#${t.property_id || "N/A"}`}</span>
                    <span className="text-gray-500 text-xs line-clamp-1">{t.property?.address}</span>
                </div>
            </td>
            <td className="p-4"><StatusPill value={t.status} /></td>
            <td className="p-4 text-right font-semibold text-gray-800">{php.format(Number(t.tcp || 0))}</td>
            <td className="p-4 text-right text-green-700 font-semibold">{php.format(paidAmount)}</td>
            <td className="p-4 text-right font-extrabold text-red-600">{php.format(Number(t.balance_amount || 0))}</td>
            <td className="p-4 text-right">
                <button
                    onClick={() => openReview(t)}
                    className="btn-outline btn-sm group"
                    type="button"
                >
                    <FontAwesomeIcon icon={faEye} className="mr-2 group-hover:scale-110 transition-transform" />
                    View
                </button>
            </td>
        </motion.tr>
    );
}

function StatusPill({ value }) {
    const statusConfig = {
        DRAFT: { color: "bg-gray-100 text-gray-800", icon: faFileInvoice },
        RESERVED: { color: "bg-amber-100 text-amber-800", icon: faClock },
        BOOKED: { color: "bg-blue-100 text-blue-800", icon: faReceipt },
        SOLD: { color: "bg-emerald-100 text-emerald-800", icon: faCheckCircle },
        CANCELLED: { color: "bg-rose-100 text-rose-800", icon: faTimesCircle },
        EXPIRED: { color: "bg-gray-200 text-gray-700", icon: faTimesCircle },
        REFUNDED: { color: "bg-purple-100 text-purple-800", icon: faMoneyBillWave },
    };

    const config = statusConfig[value] || statusConfig.DRAFT;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold ${config.color}`}>
            <FontAwesomeIcon icon={config.icon} className="w-3 h-3" />
            {value}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="card text-center p-12 animate-fade-in">
            <div className="avatar-lg mx-auto mb-6 bg-gray-100">
                <FontAwesomeIcon icon={faFileInvoice} className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No transactions found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find any transactions matching your current filters.
            </p>
            <button
                onClick={() => router.get(route("buyer.transactions.index"), {}, { preserveScroll: true })}
                className="btn-primary"
            >
                <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
                Clear Filters
            </button>
        </div>
    );
}

function Pagination({ meta }) {
    if (!meta?.links || meta.links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(meta.current_page - 1) * meta.per_page + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(meta.current_page * meta.per_page, meta.total)}</span> of{" "}
                <span className="font-semibold">{meta.total}</span> transactions
            </div>
            <div className="flex items-center gap-2">
                {meta.links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.url || "#"}
                        className={`btn-sm ${link.active
                            ? "btn-primary"
                            : "btn-outline"
                        } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </nav>
    );
}

function MobileTransactionCard({ t, openReview, php }) {
    const createdDate = new Date(t.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const paidAmount = Number((t.reservation_amount || 0) + (t.downpayment_amount || 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="card-hover p-6 space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="avatar-sm bg-primary-500 text-white">
                        <FontAwesomeIcon icon={faFileInvoice} className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-gray-500">Transaction ID</span>
                        <span className="block font-bold text-gray-900">#{t.id}</span>
                    </div>
                </div>
                <StatusPill value={t.status} />
            </div>

            {/* Property Info */}
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{t.property?.title || "N/A"}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{t.property?.address}</p>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <span className="text-xs text-gray-600 block">TCP</span>
                    <span className="font-bold text-gray-900">{php.format(Number(t.tcp || 0))}</span>
                </div>
                <div className="text-center">
                    <span className="text-xs text-gray-600 block">Balance</span>
                    <span className="font-bold text-red-600">{php.format(Number(t.balance_amount || 0))}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">{createdDate}</span>
                <button
                    onClick={() => openReview(t)}
                    className="btn-outline btn-sm group"
                    type="button"
                >
                    <FontAwesomeIcon icon={faEye} className="mr-2 group-hover:scale-110 transition-transform" />
                    View Details
                </button>
            </div>
        </motion.div>
    );
}

/* --- Enhanced Modal --- */
function BuyerTxModal({ open, onClose, tx }) {
    if (!open || !tx) return null;

    const printCertificate = () => {
        window.print();
    };

    const downloadPDF = () => {
        // PDF download functionality would go here
        alert("PDF download functionality would be implemented here");
    };

    return (
        <Modal show={open} maxWidth="4xl" onClose={onClose}>
            <div className="flex flex-col max-h-[80vh] bg-white rounded-xl">
                {/* Header */}
                <div className="no-print flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
                        <p className="text-sm text-gray-500 mt-1">#{tx.id} • {tx.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={downloadPDF}
                            className="btn-outline btn-sm"
                            type="button"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            PDF
                        </button>
                        <button
                            onClick={printCertificate}
                            className="btn-primary btn-sm"
                            type="button"
                        >
                            <FontAwesomeIcon icon={faPrint} className="mr-2" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">

                        <div id="certificate-root" className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                            <Certificate tx={tx} />
                        </div>
                </div>

                {/* Footer */}
                <div className="no-print flex justify-end gap-3 p-6 border-t border-gray-200 shrink-0">
                    <button onClick={onClose} className="btn-secondary" type="button">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function SummaryCard({ title, value, variant = "default" }) {
    const variantClasses = {
        default: "bg-gray-50 text-gray-900",
        success: "bg-emerald-50 text-emerald-900",
        error: "bg-rose-50 text-rose-900"
    };

    return (
        <div className={`p-4 rounded-lg border ${variantClasses[variant]} border-current border-opacity-20`}>
            <div className="text-sm font-semibold mb-1">{title}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}

function KV({ k, v, className = "" }) {
    return (
        <div className={`flex flex-col ${className}`}>
            <span className="text-gray-600 text-sm font-medium mb-1">{k}</span>
            <span className="text-gray-900">{v}</span>
        </div>
    );
}

function Certificate({ tx }) {
    const cur = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate amounts
    const reservationAmount = Number(tx.reservation_amount || 0);
    const downpaymentAmount = Number(tx.downpayment_amount || 0);
    const totalPaid = reservationAmount + downpaymentAmount;
    const balanceAmount = Number(tx.balance_amount || 0);
    const tcp = Number(tx.tcp || 0);

    return (
        <div className="certificate-container bg-white text-gray-900 max-w-4xl mx-auto">
            {/* Certificate Header */}
            <div className="certificate-header text-center mb-8 py-6 border-b-2 border-amber-500">
                <div className="flex justify-center items-center mb-4">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-amber-400 shadow-lg">
                        MJVI
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">TRANSACTION CERTIFICATE</h1>
                <p className="text-lg text-gray-700 font-medium">MJVI Realty Corporation</p>
                <p className="text-gray-600 text-sm mt-1">Trusted Properties • Seamless Transactions</p>
                <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500">
                    <span>Certificate ID: #{tx.id}</span>
                    <span>•</span>
                    <span>Generated: {today}</span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-8">
                <div className={`px-6 py-3 rounded-full font-bold text-sm ${
                    tx.status === 'SOLD' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        tx.status === 'RESERVED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            tx.status === 'BOOKED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                    STATUS: {tx.status}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Property Information */}
                <div className="space-y-4">
                    <div className="section-card">
                        <h3 className="section-title">
                            <FontAwesomeIcon icon={faHome} className="mr-2 text-amber-600" />
                            Property Information
                        </h3>
                        <div className="space-y-3">
                            <InfoRow label="Property Title" value={tx.property?.title || `Property #${tx.property_id || "N/A"}`} />
                            <InfoRow label="Address" value={tx.property?.address || "Not specified"} />
                            <InfoRow label="Transaction Date" value={new Date(tx.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })} />
                        </div>
                    </div>

                    <div className="section-card">
                        <h3 className="section-title">
                            <FontAwesomeIcon icon={faUser} className="mr-2 text-amber-600" />
                            Transaction Details
                        </h3>
                        <div className="space-y-3">
                            <InfoRow label="Financing Type" value={tx.financing || "Not specified"} />
                            <InfoRow label="Payment Mode" value={tx.payment_mode || "Not specified"} />
                            <InfoRow label="Reference No." value={`#${tx.id}`} />
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                    <div className="section-card">
                        <h3 className="section-title">
                            <FontAwesomeIcon icon={faCalculator} className="mr-2 text-amber-600" />
                            Price Breakdown
                        </h3>
                        <div className="space-y-2">
                            <AmountRow label="Base Price" amount={tx.base_price} />
                            <AmountRow label="Discount" amount={-tx.discount_amount} positive={false} />
                            <AmountRow label="Additional Fees" amount={tx.fees_amount} />
                            <div className="border-t border-gray-300 pt-2 mt-2">
                                <AmountRow label="Total Contract Price (TCP)" amount={tcp} bold primary />
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3 className="section-title">
                            <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-amber-600" />
                            Payment Summary
                        </h3>
                        <div className="space-y-2">
                            <AmountRow label="Reservation Fee" amount={reservationAmount} />
                            <AmountRow label="Downpayment" amount={downpaymentAmount} />
                            <div className="border-t border-gray-300 pt-2">
                                <AmountRow label="Total Paid" amount={totalPaid} bold />
                            </div>
                            <div className="border-t border-gray-300 pt-2">
                                <AmountRow label="Balance Due" amount={balanceAmount} bold warning={balanceAmount > 0} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {tcp > 0 && (
                <div className="section-card mb-8">
                    <h3 className="section-title">
                        <FontAwesomeIcon icon={faChartBar} className="mr-2 text-amber-600" />
                        Payment Progress
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Payment Completion</span>
                            <span>{Math.round((totalPaid / tcp) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-amber-500 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.min(100, (totalPaid / tcp) * 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>{cur.format(totalPaid)} paid</span>
                            <span>{cur.format(balanceAmount)} remaining</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Remarks */}
            {tx.remarks && (
                <div className="section-card">
                    <h3 className="section-title">
                        <FontAwesomeIcon icon={faStickyNote} className="mr-2 text-amber-600" />
                        Additional Remarks
                    </h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{tx.remarks}</p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="certificate-footer text-center mt-10 pt-6 border-t-2 border-amber-500">
                <div className="flex justify-between items-center text-xs text-gray-600">
                    <div className="text-left">
                        <p className="font-medium">Team Susan</p>
                        <p>MJVI Realty Corporation</p>
                    </div>
                    <div className="text-center">
                        <p className="font-medium">Official Document</p>
                        <p>This is a computer-generated certificate</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium">Need Assistance?</p>
                        <p>contact@mjyirealty.com</p>
                    </div>
                </div>
                <div className="mt-4 text-[10px] text-gray-500">
                    © {new Date().getFullYear()} MJVI Realty Corporation. All rights reserved.
                </div>
            </div>
        </div>
    );
}

// Helper Components
function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium text-sm">{label}</span>
            <span className="text-gray-900 font-semibold text-right max-w-[60%]">{value}</span>
        </div>
    );
}

function AmountRow({ label, amount, bold = false, primary = false, warning = false, positive = true }) {
    const cur = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const numAmount = Number(amount || 0);

    let amountClass = "text-gray-900";
    if (primary) amountClass = "text-amber-600";
    if (warning) amountClass = "text-red-600";
    if (!positive && numAmount > 0) amountClass = "text-green-600";
    if (!positive && numAmount < 0) amountClass = "text-red-600";

    return (
        <div className="flex justify-between items-center py-1">
            <span className={`text-gray-600 text-sm ${bold ? 'font-bold' : 'font-medium'}`}>{label}</span>
            <span className={`font-semibold text-right ${amountClass} ${bold ? 'text-lg' : ''}`}>
                {!positive && numAmount > 0 ? '-' : ''}{cur.format(Math.abs(numAmount))}
            </span>
        </div>
    );
}


function Row({ label, value, bold = false, className = "" }) {
    return (
        <div className="flex justify-between py-1 items-center">
            <span className="text-neutral-500">{label}</span>
            <span className={`text-right ${bold ? 'font-extrabold' : 'font-medium'} ${className}`}>{value}</span>
        </div>
    );
}
