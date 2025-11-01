import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx"; // or AppLayout if you prefer
import Modal from "@/Components/Modal";
import { ChevronRightIcon, FunnelIcon, CalendarIcon } from "@heroicons/react/24/outline";
import logo from "../../../../assets/framer_logo.png"

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
        router.get(route("buyer.transactions.index"), {}, {
            preserveState: true, replace: true, preserveScroll: true,
        });
    };

    // modal
    const [open, setOpen] = React.useState(false);
    const [tx, setTx] = React.useState(null);
    const openReview = (row) => { setTx(row); setOpen(true); };

    return (
        <BuyerLayout>
            <Head title="My Transactions" />

            <header className="bg-white">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex ">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Transactions</h1>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Stat title="All" value={totals.all} />
                    <Stat title="Draft" value={totals.draft} />
                    <Stat title="Reserved" value={totals.reserved} />
                    <Stat title="Booked" value={totals.booked} />
                    <Stat title="Total Contract Price" value={php.format(totals.tcp_sum || 0)} primary />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <FunnelIcon className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Filter</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Property, reference..."
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white transition text-sm px-3 py-2"
                                value={local.search}
                                onChange={(e) => setLocal(s => ({ ...s, search: e.target.value }))}
                                onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); applyFilters(); } }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white text-sm px-3 py-2"
                                value={local.status}
                                onChange={(e) => setLocal(s => ({ ...s, status: e.target.value }))}
                            >
                                <option value="">All</option>
                                {["DRAFT","RESERVED","BOOKED","SOLD","CANCELLED","EXPIRED","REFUNDED"].map(s=>(
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2 md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Date Range</label>
                            {/* FIX: Reverting to the correct horizontal flex layout for date inputs */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    aria-label="Date From"
                                    className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white text-sm px-3 py-2"
                                    value={local.date_from}
                                    onChange={(e) => setLocal(s => ({ ...s, date_from: e.target.value }))}
                                />
                                <span className="text-gray-500 shrink-0">-</span>
                                <input
                                    type="date"
                                    aria-label="Date To"
                                    className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white text-sm px-3 py-2"
                                    value={local.date_to}
                                    onChange={(e) => setLocal(s => ({ ...s, date_to: e.target.value }))}
                                />
                            </div>
                        </div>
                        {/* FIX: Removed ml-6 and border, ensuring correct alignment within the grid */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Items / Page</label>
                            <select
                                className="w-full rounded-lg bg-gray-100 text-gray-700 border-transparent focus:ring-2 focus:ring-amber-400 focus:bg-white text-sm px-3 py-2"
                                value={local.items_per_page}
                                onChange={(e) => setLocal(s => ({ ...s, items_per_page: Number(e.target.value) }))}
                            >
                                {[10,20,30,50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Mobile Card View (Visible on small screens) */}
                <div className="md:hidden space-y-4">
                    {transactions.data.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 font-medium bg-white rounded-xl shadow-md">No transactions found.</div>
                    ) : (
                        transactions.data.map((t) => (
                            <MobileTransactionCard key={t.id} t={t} openReview={openReview} php={php} />
                        ))
                    )}
                </div>


                {/* Table View (Visible on medium/large screens) */}
                <div className="hidden md:block bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                        <tr className="text-left text-amber-800">
                            <Th>Date</Th>
                            <Th>Property</Th>
                            <Th>Status</Th>
                            <Th className="text-right">TCP</Th>
                            <Th className="text-right">Paid</Th>
                            <Th className="text-right">Balance</Th>
                            <Th className="text-right">Action</Th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.data.length === 0 && (
                            <tr><td colSpan="7" className="p-4 text-center text-gray-500 font-medium">No transactions found.</td></tr>
                        )}

                        {transactions.data.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition">
                                <Td className="text-gray-600">
                                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Td>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 line-clamp-1">{t.property?.title || `#${t.property_id || "N/A"}`}</span>
                                        <span className="text-gray-500 text-xs line-clamp-1">{t.property?.address}</span>
                                    </div>
                                </Td>
                                <Td><StatusPill value={t.status} /></Td>
                                <Td className="text-right font-semibold text-gray-800">{php.format(Number(t.tcp || 0))}</Td>
                                <Td className="text-right text-green-700 font-semibold">{php.format(Number((t.reservation_amount || 0) + (t.downpayment_amount || 0)))}</Td>
                                <Td className="text-right font-extrabold text-red-600">{php.format(Number(t.balance_amount || 0))}</Td>
                                <Td className="text-right">
                                    <button
                                        onClick={() => openReview(t)}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                                        type="button"
                                    >
                                        Review
                                    </button>
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <Pagination meta={transactions} />
            </main>

            {/* Modal */}
            <BuyerTxModal open={open} onClose={() => setOpen(false)} tx={tx} />
        </BuyerLayout>
    );
}

/* --- Helpers & Small Components --- */

function Th({ children, className="" }) {
    return <th className={`p-4 text-xs font-bold uppercase tracking-wider ${className}`}>{children}</th>;
}
function Td({ children, className="" }) {
    return <td className={`p-4 border-b border-gray-100 ${className}`}>{children}</td>;
}
function Stat({ title, value, primary }) {
    const box = primary ? "bg-amber-50 text-amber-800" : "bg-white text-gray-800 border border-gray-100";
    const num = primary ? "text-xl sm:text-2xl font-extrabold text-amber-700" : "text-lg sm:text-xl font-bold text-gray-900";
    return (
        <div className={`rounded-xl p-4 sm:p-5 shadow-sm ${box}`}>
            <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">{title}</div>
            <div className={num}>{value}</div>
        </div>
    );
}
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
function Pagination({ meta }) {
    if (!meta?.links || meta.links.length <= 3) return null; // Hide if only prev/next/1st page are present
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center pt-4">
            {meta.links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || "#"}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${link.active
                        ? "bg-amber-600 text-white shadow-md shadow-amber-200"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

// --- NEW MOBILE CARD VIEW COMPONENT ---
function MobileTransactionCard({ t, openReview, php }) {
    const createdDate = new Date(t.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const paidAmount = Number((t.reservation_amount || 0) + (t.downpayment_amount || 0));

    return (
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-gray-500">Transaction ID</span>
                    <span className="font-extrabold text-lg text-gray-900">#{t.id}</span>
                </div>
                <StatusPill value={t.status} />
            </div>

            <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase text-gray-500">Property</span>
                <span className="font-medium text-base text-gray-900 line-clamp-1">{t.property?.title || `N/A`}</span>
                <span className="text-xs text-gray-500 line-clamp-1">{t.property?.address}</span>
            </div>

            <div className="grid grid-cols-3 text-sm pt-2 border-t border-gray-100">
                <KV k="Date" v={createdDate} />
                <KV k="TCP" v={php.format(Number(t.tcp || 0))} className="text-right" />
                <KV k="Balance" v={php.format(Number(t.balance_amount || 0))} className="text-right font-extrabold text-red-600" />
                <div className="col-span-3 mt-3 text-sm flex justify-end">
                    <button
                        onClick={() => openReview(t)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                        type="button"
                    >
                        View Details <ChevronRightIcon className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
// --- END NEW MOBILE CARD VIEW COMPONENT ---

/* --- Buyer Modal with Certificate (Updated for better mobile responsiveness) --- */
function BuyerTxModal({ open, onClose, tx }) {
    if (!open || !tx) return null;

    // inside BuyerTxModal
    const css = `
  @media print {
    /* 1) Remove browser page margins; we'll add our own padding */
    @page { size: A4; margin: 0; }

    html, body {
      margin: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: #ffffff !important;
    }

    /* 2) Hide everything except the certificate */
    body * { visibility: hidden !important; }

    /* 3) Make certificate visible and FIXED to the page edges */
    #certificate-root, #certificate-root * { visibility: visible !important; }
    #certificate-root {
      position: fixed !important;
      top: 0; left: 0; right: 0; bottom: 0;
      /* This becomes your printable margin (≈ 14mm all around) */
      padding: 14mm !important;

      /* Remove any UI look for print */
      box-shadow: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: #fff !important;
      overflow: visible !important; /* or auto if you want scroll on very long content */
    }

    /* 4) Hide modal header/footer/buttons etc */
    .no-print { display: none !important; }

    /* 5) Guard against any accidental top gaps from first-child margins */
    #certificate-root > *:first-child { margin-top: 0 !important; }
  }
`;



    return (
        <>
            <style>{css}</style>
            <Modal show={open} maxWidth="4xl" onClose={onClose}>
                {/* Fixed Header and Scrollable Content Container */}
                <div className="flex flex-col max-h-[80vh] bg-white rounded-xl shadow-2xl">

                    {/* 1. Fixed Header (Always visible, non-scrolling) */}
                    <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b shrink-0">
                            <h2 className="text-lg font-semibold">Transaction Details</h2>
                            <p className="text-sm text-gray-500">#{tx.id} — {tx.status}</p>
                    </div>

                    {/* 2. Scrollable Body (Flex-grow ensures it takes the remaining height) */}
                    <div className="flex-grow overflow-y-auto">
                        <div className="p-4 sm:p-6 space-y-6">
                            {/* Quick Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <KV k="Property" v={tx.property?.title || `#${tx.property_id || "-"}`} />
                                <KV k="Address" v={tx.property?.address || "-"} className="col-span-2 md:col-span-1" />
                                <KV k="TCP" v={php.format(Number(tx.tcp || 0))} />
                                <KV k="Paid (Resv + DP)" v={php.format(Number((tx.reservation_amount || 0) + (tx.downpayment_amount || 0)))} />
                                <KV k="Balance" v={php.format(Number(tx.balance_amount || 0))} />
                                <KV k="Financing" v={tx.financing || "-"} />
                                <KV k="Reference No." v={tx.reference_no || "-"} />
                            </div>

                            {tx.remarks ? (
                                <div className="text-sm">
                                    <div className="text-gray-600 mb-1 font-semibold">Remarks</div>
                                    <div className="border rounded-lg p-3 bg-gray-50 whitespace-pre-wrap text-gray-700">{tx.remarks}</div>
                                </div>
                            ) : null}

                            {/* Printable Certificate */}
                            <div id="certificate-root" className="border rounded-2xl p-4 sm:p-6 bg-white">
                                <Certificate tx={tx} />
                            </div>
                        </div>
                    </div>
                    <div className="no-print flex flex-col sm:flex-row items-end sm:items-end justify-end px-5 py-4 border-b shrink-0">
                        <div className="flex gap-2 mt-3 sm:mt-0">
                            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-neutral-50" type="button">Close</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

function KV({ k, v, className="" }) {
    return (
        <div className={`flex flex-col ${className}`}>
            <span className="text-gray-500 text-xs sm:text-sm">{k}</span>
            <span className="font-medium text-sm sm:text-base">{v}</span>
        </div>
    );
}

function Certificate({ tx }) {
    const cur = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const today = new Date().toLocaleDateString();

    return (
        <div className="text-[13px] leading-relaxed text-neutral-900">
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">
                {/* Preferred: replace with your actual logo path */}
                <img
                    src={logo}
                    alt="MJVI Realty Logo"
                    className="w-16 h-16 mb-2 object-contain"
                    onError={(e) => {
                        // fallback to a styled circle with initials
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-16 h-16 mb-2 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold border-2 border-amber-500/30';
                        fallback.innerText = 'MJVI';
                        e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget.nextSibling);
                    }}
                />
                <h2 className="text-xl font-semibold tracking-wide">Transaction Certificate</h2>
                <p className="text-neutral-800 font-medium">MJVI Realty</p>
                <p className="text-neutral-600 text-xs">Trusted Properties. Seamless Transactions.</p>
                <p className="text-neutral-500 text-[11px] mt-1">
                    Team Susan
                </p>
                <p className="text-neutral-500 text-[11px]">Generated on {today}</p>
                <div className="w-16 h-[2px] bg-black mt-3" />
            </div>

            {/* Body */}
            <div className="space-y-4">
                <section className="border rounded-lg p-3">
                    <h3 className="font-medium mb-2 text-base">Transaction Info</h3>
                    <Row label="Transaction ID" value={`#${tx.id}`} />
                    <Row label="Status" value={tx.status} />
                    <Row label="Created At" value={tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"} />
                    <Row label="Reference No." value={tx.reference_no || "-"} />
                </section>

                <section className="border rounded-lg p-3">
                    <h3 className="font-medium mb-2 text-base">Parties</h3>
                    <Row label="Buyer" value={tx.buyer?.name || "-"} />
                    <Row label="Buyer Email" value={tx.buyer?.email || "-"} />
                    <Row label="Agent" value={tx.primary_agent?.name || tx.primaryAgent?.name || tx.agent?.name || "-"} />
                </section>

                <section className="border rounded-lg p-3">
                    <h3 className="font-medium mb-2 text-base">Property</h3>
                    <Row label="Title" value={tx.property?.title || `#${tx.property_id || "-"}`} />
                    <Row label="Address" value={tx.property?.address || "-"} />
                </section>

                <section className="border rounded-lg p-3">
                    <h3 className="font-medium mb-2 text-base">Financial Summary</h3>
                    <Row label="Base Price" value={cur.format(Number(tx.base_price || 0))} />
                    <Row label="Discount" value={cur.format(Number(tx.discount_amount || 0))} />
                    <Row label="Fees" value={cur.format(Number(tx.fees_amount || 0))} />
                    <Row label="TCP (Total Contract Price)" value={cur.format(Number(tx.tcp || 0))} bold />
                    <div className="py-1 border-t border-dashed my-1" />
                    <Row label="Reservation" value={cur.format(Number(tx.reservation_amount || 0))} />
                    <Row label="Downpayment" value={cur.format(Number(tx.downpayment_amount || 0))} />
                    <Row label="Balance Due" value={cur.format(Number(tx.balance_amount || 0))} bold className="text-red-600" />
                    <div className="py-1 border-t border-dashed my-1" />
                    <Row label="Financing" value={tx.financing || "-"} />
                    <Row label="Mode of Payment" value={tx.financing || "-"} />
                </section>

                {tx.remarks ? (
                    <section className="border rounded-lg p-3">
                        <h3 className="font-medium mb-2 text-base">Remarks</h3>
                        <div className="whitespace-pre-wrap text-neutral-700">{tx.remarks}</div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}

function Row({ label, value, bold=false, className="" }) {
    return (
        <div className="flex justify-between py-1 items-center">
            <span className="text-neutral-500">{label}</span>
            <span className={`text-right ${bold ? 'font-extrabold' : 'font-medium'} ${className}`}>{value}</span>
        </div>
    );
}
