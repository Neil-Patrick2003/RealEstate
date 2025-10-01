// resources/js/Pages/Agents/Transaction.jsx
import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Link, router } from "@inertiajs/react";
import debounce from "lodash/debounce";
import { Search } from "lucide-react";

/* =========================
   Tiny theme-aligned UI bits
   ========================= */

const PageHeader = ({ title, subtitle, right }) => (
    <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
            {right}
        </div>
    </div>
);

const Toolbar = ({ children }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">{children}</div>
    </div>
);

const SearchInput = ({ value, onChange, placeholder = "Search…" }) => (
    <div className="relative">
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="pl-9 pr-3 py-2 h-10 text-sm rounded-md bg-gray-50 focus:bg-white border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none w-[260px]"
        />
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
    </div>
);

const StatusPill = ({ value = "" }) => {
    const key = String(value).toLowerCase();
    const map = {
        sold: "bg-emerald-100 text-emerald-700",
        pending: "bg-yellow-100 text-yellow-800",
        cancelled: "bg-gray-100 text-gray-700",
        default: "bg-gray-100 text-gray-700",
    };
    const cls = map[key] || map.default;
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{value || "—"}</span>;
};

const DataCard = ({ title, actions, children }) => (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        {(title || actions) && (
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
                {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : <div />}
                {actions}
            </div>
        )}
        {children}
    </div>
);

const PaginationFooter = ({ links }) => {
    if (!Array.isArray(links) || links.length <= 1) return null;
    return (
        <div className="p-4 flex flex-wrap gap-2 justify-end border-t border-gray-200">
            {links.map((link, i) =>
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        className={`px-3 py-1.5 text-sm rounded-md border transition ${
                            link.active
                                ? "bg-primary text-white font-semibold border-primary"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={i}
                        className="px-3 py-1.5 text-sm text-gray-400 bg-white border rounded-md cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
};

/* =========================
   Money + Table
   ========================= */

const formatMoney = (n) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(
        Number(n || 0)
    );

const TransactionsTable = ({ rows = [] }) => {
    if (!rows.length) {
        return <div className="p-10 text-center text-gray-500">No transactions found.</div>;
    }

    return (
        <>
            {/* Desktop table */}
            <table className="min-w-full text-sm text-gray-800 hidden md:table">
                <thead className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wide">
                <tr>
                    <th className="p-3 text-left">Property</th>
                    <th className="p-3 text-left">Seller</th>
                    <th className="p-3 text-left">Buyer</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Sold At</th>
                    <th className="p-3 text-left">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-200">
                {rows.map((txn) => {
                    const property = txn?.property_listing?.property;
                    const seller = txn?.property_listing?.seller;
                    const buyer = txn?.buyer;

                    return (
                        <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="p-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                        alt={property?.title || "Property"}
                                        className="w-14 h-14 object-cover rounded-md border border-gray-200"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{property?.title || "—"}</p>
                                        <p className="text-xs text-gray-500">{property?.address || "—"}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-3">
                                <p className="text-sm font-medium text-gray-900">{seller?.name || "—"}</p>
                                <p className="text-xs text-gray-500">{seller?.email || "—"}</p>
                            </td>
                            <td className="p-3">
                                <p className="text-sm font-medium text-gray-900">{buyer?.name || "—"}</p>
                                <p className="text-xs text-gray-500">{buyer?.email || "—"}</p>
                            </td>
                            <td className="p-3">
                                <p className="text-sm font-semibold text-emerald-600">{formatMoney(txn.amount)}</p>
                            </td>
                            <td className="p-3 text-sm text-gray-700">{dayjs(txn.created_at).format("MMM D, YYYY")}</td>
                            <td className="p-3">
                                <StatusPill value={txn.status} />
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
                {rows.map((txn) => {
                    const property = txn?.property_listing?.property;
                    const seller = txn?.property_listing?.seller;
                    const buyer = txn?.buyer;

                    return (
                        <div key={txn.id} className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                    alt={property?.title || "Property"}
                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                />
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{property?.title || "—"}</p>
                                    <p className="text-xs text-gray-500 truncate">{property?.address || "—"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Seller</p>
                                    <p className="text-gray-800">{seller?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Buyer</p>
                                    <p className="text-gray-800">{buyer?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="font-semibold text-emerald-600">{formatMoney(txn.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Sold At</p>
                                    <p className="text-gray-800">{dayjs(txn.created_at).format("MMM D, YYYY")}</p>
                                </div>
                            </div>

                            <div className="mt-3">
                                <StatusPill value={txn.status} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

/* =========================
   Page Component
   ========================= */

export default function Transaction({
                                        transactions,
                                        search = "",
                                        status = "all",
                                        date_from = "",
                                        date_to = "",
                                    }) {
    const [q, setQ] = useState(search || "");
    const [st, setSt] = useState(status || "all");
    const [from, setFrom] = useState(date_from || "");
    const [to, setTo] = useState(date_to || "");
    const [loading, setLoading] = useState(false);

    const run = useCallback(
        debounce((q1, s1, f1, t1) => {
            setLoading(true);
            router.get(
                "/agents/transaction",
                {
                    search: q1 || undefined,
                    status: s1 || undefined,
                    date_from: f1 || undefined,
                    date_to: t1 || undefined,
                },
                { preserveState: true, replace: true, onFinish: () => setLoading(false) }
            );
        }, 450),
        []
    );

    useEffect(() => () => run.cancel(), [run]);

    const exportCsv = () => {
        const rows = transactions?.data ?? [];
        const header = ["Property", "Seller", "Buyer", "Amount", "Sold At", "Status"];
        const body = rows.map((t) => [
            (t?.property_listing?.property?.title || "").replaceAll(",", " "),
            t?.property_listing?.seller?.name || "",
            t?.buyer?.name || "",
            String(t?.amount || 0),
            dayjs(t?.created_at).format("YYYY-MM-DD"),
            t?.status || "",
        ]);
        const csv = [header, ...body].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${dayjs().format("YYYYMMDD_HHmm")}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <AgentLayout>
            <PageHeader
                title="My Transactions"
                subtitle="Track settled deals and payments."
                right={
                    <button
                        onClick={exportCsv}
                        className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50"
                    >
                        Export CSV
                    </button>
                }
            />

            <Toolbar>
                {/* Status filter */}
                <select
                    value={st}
                    onChange={(e) => {
                        setSt(e.target.value);
                        run(q, e.target.value, from, to);
                    }}
                    className="h-10 px-3 text-sm rounded-md border border-gray-300 bg-white"
                    title="Status"
                >
                    <option value="all">All status</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                {/* Date range */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => {
                            setFrom(e.target.value);
                            run(q, st, e.target.value, to);
                        }}
                        className="h-10 px-3 text-sm rounded-md border border-gray-300 bg-white"
                    />
                    <span className="text-xs text-gray-500">to</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => {
                            setTo(e.target.value);
                            run(q, st, from, e.target.value);
                        }}
                        className="h-10 px-3 text-sm rounded-md border border-gray-300 bg-white"
                    />
                </div>

                <div className="flex-1" />

                {/* Search */}
                <SearchInput
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        run(e.target.value, st, from, to);
                    }}
                    placeholder="Search property, buyer, seller…"
                />
            </Toolbar>

            <DataCard>
                {loading ? (
                    <div className="p-6 text-sm text-gray-500">Loading…</div>
                ) : (
                    <>
                        <TransactionsTable rows={transactions?.data || []} />
                        <PaginationFooter links={transactions?.links} />
                    </>
                )}
            </DataCard>
        </AgentLayout>
    );
}
