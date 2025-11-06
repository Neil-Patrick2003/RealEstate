import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout.jsx"; // Keeping this for reference, though BrokerLayout is used
import TransactionReviewModal from "./TransactionReviewModal.jsx";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";

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
        // NOTE: The route name here here was 'agents.transaction.index'. Ensure this is correct.
        router.get(route('agents.transaction.index'), local, { preserveState: true, replace: true });
    };
    const resetFilters = () => {
        setLocal({ status: "", search: "", date_from: "", date_to: "" });
        // NOTE: The route name here here was 'agents.transaction.index'. Ensure this is correct.
        router.get(route('agents.transaction.index'), {}, { preserveState: true, replace: true });
    };

    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedTx, setSelectedTx] = React.useState(null);

    function openReview(tx) {
        setSelectedTx(tx);
        setModalOpen(true);
    }

    return (
        <BrokerLayout>

            <Head title="My Transactions" />

            {/* --- Header: Clean, border-bottom for elegance --- */}
            {/* Removed shadow, added a subtle border-b for clean separation */}
            <header className="bg-white border-b border-gray-100">
                <div className="px-4 md:px-8 lg:px-10 py-5 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-light text-gray-800 tracking-wider">Transaction Management</h1>
                    {/* Primary Button: Reduced padding on mobile */}
                </div>
            </header>

            {/* --- Main Content: Increased padding for more white space --- */}
            <main className="px-4 md:px-8 lg:px-10 py-8 space-y-8 min-h-screen">
                <TransactionReviewModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    tx={selectedTx}
                />

                {/* --- Stats: Elegance through soft borders and minimal shadow --- */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
                    <Stat title="All" value={totals.all} />
                    <Stat title="Draft" value={totals.draft} />
                    <Stat title="Reserved" value={totals.reserved} />
                    <Stat title="Booked" value={totals.booked} />

                    {/* Primary Stat Highlighted with Soft Amber BG */}
                    <Stat
                        title="Total Contract Price"
                        value={php.format(totals.tcp_sum || 0)}
                        isPrimary={true}
                    />
                </div>

                {/* --- Filters: Border Thin/Clean UI - White background with thin border --- */}
                <div className="bg-white rounded-xl p-5 sm:p-7 border border-gray-200"> {/* Added border */}
                    <h3 className="text-lg font-light text-gray-800 mb-5 border-b pb-3 border-gray-100">Filter Transactions</h3>

                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                            <select
                                // Cleaned up input focus/border to be more subtle
                                className="w-full rounded-lg bg-white text-gray-700 border border-gray-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm py-2"
                                value={local.status}
                                onChange={(e) => setLocal((s) => ({ ...s, status: e.target.value }))}
                            >
                                <option value="">All Statuses</option>
                                {["DRAFT","RESERVED","BOOKED","SOLD","CANCELLED","EXPIRED","REFUNDED"].map(s=>(
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Buyer, property, reference..."
                                // Cleaned up input focus/border to be more subtle
                                className="w-full rounded-lg bg-white text-gray-700 border border-gray-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm px-3 py-2"
                                value={local.search}
                                onChange={(e)=>setLocal(s=>({...s, search: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">From Date</label>
                            <input
                                type="date"
                                // Cleaned up input focus/border to be more subtle
                                className="w-full rounded-lg bg-white text-gray-700 border border-gray-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm px-3 py-2"
                                value={local.date_from}
                                onChange={(e)=>setLocal(s=>({...s, date_from: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">To Date</label>
                            <input
                                type="date"
                                // Cleaned up input focus/border to be more subtle
                                className="w-full rounded-lg bg-white text-gray-700 border border-gray-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm px-3 py-2"
                                value={local.date_to}
                                onChange={(e)=>setLocal(s=>({...s, date_to: e.target.value}))}
                            />
                        </div>
                    </div>

                    {/* Flat Buttons: Elegantly separated with a thin border */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3 justify-end">
                        <button
                            onClick={resetFilters}
                            // Simplified 'Clear' button
                            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-amber-600 hover:bg-gray-50 transition"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={applyFilters}
                            // Elegant 'Apply' button with soft shadow
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* --- Table: Ultra Clean, Thin Borders --- */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto"> {/* Replaced shadow with border */}
                    <table className="w-full text-sm min-w-[800px]">
                        {/* Header: White background with thin bottom border */}
                        <thead className="border-b border-gray-200">
                        <tr className="text-left text-gray-500">
                            <Th>Created Date</Th>
                            <Th>Buyer Details</Th>
                            <Th>Property</Th>
                            <Th>Status</Th>
                            <Th className="text-right">TCP</Th>
                            <Th className="text-right">Balance Due</Th>
                            <Th className="text-right">Action</Th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.data.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-5 text-center text-gray-400 font-light">No transactions matching the current filters were found.</td>
                            </tr>
                        )}

                        {transactions.data.map((t) => (
                            // Hover effect is subtle
                            <tr key={t.id} className="hover:bg-amber-50/50 transition">
                                <Td className="text-gray-500">{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Td>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">{t.buyer?.name || "—"}</span>
                                        <span className="text-gray-400 text-xs font-light">{t.buyer?.email || "No Email"}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-normal text-gray-700">{t.property?.title || `#${t.property_id || "N/A"}`}</span>
                                        <span className="text-gray-400 text-xs font-light">{t.property?.address}</span>
                                    </div>
                                </Td>
                                <Td><StatusPill value={t.status} /></Td>
                                <Td className="text-right font-medium text-gray-700">{php.format(Number(t.tcp || 0))}</Td>
                                <Td className="text-right font-semibold text-red-500">{php.format(Number(t.balance_amount || 0))}</Td>
                                <Td className="text-right">
                                    {t ? (
                                        <button
                                            onClick={() => openReview(t)}
                                            // Subtle 'Review' button
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition border border-amber-200"
                                            type="button"
                                        >
                                            Review Details
                                        </button>
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination: Elegant and Clean --- */}
                <Pagination meta={transactions} />
            </main>
        </BrokerLayout>
    );
}

// --- Helper Components: Updated for Elegance and Thin Borders ---

function Th({ children, className="" }) {
    // Increased padding, lighter font weight, removed uppercase
    return <th className={`p-4 text-xs font-medium tracking-wider ${className}`}>{children}</th>;
}
function Td({ children, className="" }) {
    // Reduced border to border-b, used a lighter gray
    return <td className={`p-4 border-b border-gray-100 ${className}`}>{children}</td>;
}

// Stat component: Thin border, light/white background, and subtle primary highlight
function Stat({ title, value, isPrimary = false }) {
    const classes = isPrimary
        // Primary Stat is subtle amber-50 background with a thin amber border
        ? "bg-amber-50 border-amber-200 text-amber-800"
        // Default stats are pure white with a thin light gray border
        : "bg-white border-gray-200 text-gray-800";

    const valueClasses = isPrimary ? "text-xl sm:text-2xl font-bold text-amber-600" : "text-lg sm:text-xl font-medium text-gray-900";

    return (
        // Added border
        <div className={`rounded-xl p-5 transition duration-150 border ${classes}`}>
            <div className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">{title}</div>
            <div className={valueClasses}>{value}</div>
        </div>
    );
}

// StatusPill component (Updated for softer colors)
function StatusPill({ value }) {
    const map = {
        DRAFT:     "bg-gray-100 text-gray-600",
        RESERVED:  "bg-amber-100 text-amber-700",
        BOOKED:    "bg-blue-50 text-blue-600",
        SOLD:      "bg-green-50 text-green-600",
        CANCELLED: "bg-red-50 text-red-600",
        EXPIRED:   "bg-gray-200 text-gray-700",
        REFUNDED:  "bg-purple-50 text-purple-600",
    };
    // Softer pill look
    return <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${map[value] || map.DRAFT}`}>{value}</span>;
}

// Pagination component: Reduced active button style for a cleaner look
function Pagination({ meta }) {
    if (!meta?.links) return null;
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center pt-4">
            {meta.links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || "#"}
                    // Clean, elegant button style
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition border ${link.active
                        // Active button is solid amber with light shadow
                        ? "bg-amber-500 text-white shadow-sm border-amber-500"
                        // Inactive button is white with light gray border
                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                    } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
