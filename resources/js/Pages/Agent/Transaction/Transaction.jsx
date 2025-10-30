import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import TransactionReviewModal from "./TransactionReviewModal.jsx";

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
        // NOTE: The route name here was 'agents.transaction.index'. Ensure this is correct.
        router.get(route('agents.transaction.index'), local, { preserveState: true, replace: true });
    };
    const resetFilters = () => {
        setLocal({ status: "", search: "", date_from: "", date_to: "" });
        // NOTE: The route name here was 'agents.transaction.index'. Ensure this is correct.
        router.get(route('agents.transaction.index'), {}, { preserveState: true, replace: true });
    };

    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedTx, setSelectedTx] = React.useState(null);

    function openReview(tx) {
        setSelectedTx(tx);
        setModalOpen(true);
    }

    return (
        <AgentLayout>

            <Head title="My Transactions" />

            {/* --- Header: Adjust padding for mobile (px-4) --- */}
            <header className="bg-white shadow-sm">
                <div className="px-2 md:px-4 lg:p-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1> {/* Shorten title on mobile */}
                    {/* Primary Button: Reduced padding on mobile */}

                </div>
            </header>

            {/* --- Main Content: Adjust padding for mobile (px-4) --- */}
            <main className="px-2 md:p-4 lg:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8  min-h-screen">
                <TransactionReviewModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    tx={selectedTx}
                />

                {/* --- Stats: Responsive Grid (Default 2 cols, MD 5 cols) --- */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                    <Stat title="All" value={totals.all} />
                    <Stat title="Draft" value={totals.draft} />
                    <Stat title="Reserved" value={totals.reserved} />
                    <Stat title="Booked" value={totals.booked} />

                    {/* Primary Stat Highlighted */}
                    <Stat
                        title="Total Contract Price"
                        value={php.format(totals.tcp_sum || 0)}
                        isPrimary={true}
                    />
                </div>

                {/* --- Filters: Responsive Layout (Stacked on mobile) --- */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Filter Transactions</h3>

                    {/* Filter Grid: Default 1 column, MD 5 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white transition text-sm"
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
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Buyer, property, reference..."
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white transition text-sm px-3 py-2"
                                value={local.search}
                                onChange={(e)=>setLocal(s=>({...s, search: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                            <input
                                type="date"
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white transition text-sm px-3 py-2"
                                value={local.date_from}
                                onChange={(e)=>setLocal(s=>({...s, date_from: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                            <input
                                type="date"
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white transition text-sm px-3 py-2"
                                value={local.date_to}
                                onChange={(e)=>setLocal(s=>({...s, date_to: e.target.value}))}
                            />
                        </div>
                    </div>

                    {/* Flat Buttons: Adjust spacing and size for mobile */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 justify-end">
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                            Clear
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary text-white hover:bg-amber-700 transition shadow-md shadow-amber-200"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* --- Table: Mobile Scroll Container --- */}
                <div className="bg-white rounded-xl shadow-md overflow-x-auto"> {/* Added overflow-x-auto */}
                    <table className="w-full text-sm min-w-[700px]"> {/* Added min-w to force scroll on small screens */}
                        {/* Header: Amber Background with White/Amber Text */}
                        <thead className="bg-gray-100">
                        <tr className="text-left text-amber-800">
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
                                <td colSpan="7" className="p-4 text-center text-gray-500 font-medium">No transactions matching the current filters were found.</td>
                            </tr>
                        )}

                        {transactions.data.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition">
                                <Td className="text-gray-600">{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Td>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{t.buyer?.name || "-"}</span>
                                        <span className="text-gray-500 text-xs">{t.buyer?.email || "No Email"}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">{t.property?.title || `#${t.property_id || "N/A"}`}</span>
                                        <span className="text-gray-500 text-xs">{t.property?.address}</span>
                                    </div>
                                </Td>
                                <Td><StatusPill value={t.status} /></Td>
                                <Td className="text-right font-semibold text-gray-800">{php.format(Number(t.tcp || 0))}</Td>
                                <Td className="text-right font-extrabold text-red-600">{php.format(Number(t.balance_amount || 0))}</Td>
                                <Td className="text-right">
                                    {t ? (
                                        <button
                                            onClick={() => openReview(t)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
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

                {/* --- Pagination: Flat Style --- */}
                <Pagination meta={transactions} />
            </main>
        </AgentLayout>
    );
}

// --- Helper Components ---

function Th({ children, className="" }) {
    return <th className={`p-4 text-xs font-bold uppercase tracking-wider ${className}`}>{children}</th>;
}
function Td({ children, className="" }) {
    // Increased padding, used border-b for separation when not hovering
    return <td className={`p-4 border-b border-gray-100 ${className}`}>{children}</td>;
}

// Stat component: Adjusted font sizes for better mobile hierarchy
function Stat({ title, value, isPrimary = false }) {
    const classes = isPrimary
        ? "bg-amber-50 text-amber-800 shadow-sm"
        : "bg-white text-gray-800 shadow-sm";

    const valueClasses = isPrimary ? "text-xl sm:text-2xl font-extrabold text-amber-700" : "text-lg sm:text-xl font-bold text-gray-900"; // Use sm: for desktop size

    return (
        <div className={`rounded-xl p-4 sm:p-5 transition duration-150 ${classes}`}> {/* Adjusted padding */}
            <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">{title}</div>
            <div className={valueClasses}>{value}</div>
        </div>
    );
}

// StatusPill component (Unchanged)
function StatusPill({ value }) {
    const map = {
        DRAFT:     "bg-neutral-100 text-neutral-800",
        RESERVED:  "bg-amber-100 text-amber-800",
        BOOKED:    "bg-blue-100 text-blue-800",
        SOLD:      "bg-green-100 text-green-800",
        CANCELLED: "bg-rose-100 text-rose-800",
        EXPIRED:   "bg-neutral-200 text-neutral-700",
        REFUNDED:  "bg-purple-100 text-purple-800",
    };
    return <span className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${map[value] || map.DRAFT}`}>{value}</span>;
}

// Pagination component: Reduced active button shadow to 'md'
function Pagination({ meta }) {
    if (!meta?.links) return null;
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center pt-4">
            {meta.links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || "#"}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${link.active
                        ? "bg-secondary text-white shadow-md shadow-amber-200"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
