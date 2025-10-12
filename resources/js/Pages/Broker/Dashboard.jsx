// resources/js/Pages/Broker/Dashboard/Index.jsx
import React, { useMemo } from "react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { router, Link } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Wallet, Home, Users, MessageSquare, Handshake, MapPin } from "lucide-react";

// --- helpers ---
const fmtInt = (n) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n ?? 0);

const money = (n = 0) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(Number(n || 0));

const fmtDateTime = (start_date, start_time, schedule_at) => {
    if (start_date) {
        // show HH:mm if available
        const hhmm = (start_time || "").slice(0, 5);
        return `${start_date}${hhmm ? ` • ${hhmm}` : ""}`;
    }
    if (schedule_at) return new Date(schedule_at).toLocaleString();
    return "—";
};

const ToolbarButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`h-9 px-3 rounded-md border text-sm transition ${
            active
                ? "bg-primary text-white border-primary"
                : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
        }`}
    >
        {children}
    </button>
);

const Kpi = ({ icon: Icon, label, value, sub }) => (
    <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4 flex items-center gap-3">
        <div className="rounded-lg bg-green-50 p-2 text-primary">
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
            {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
    </div>
);

function EmptyChartNote() {
    return (
        <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            No data for the selected range.
        </div>
    );
}

export default function Dashboard({
                                      filters = {},
                                      kpi = {},
                                      charts = {},
                                      queues = {},
                                  }) {
    // Build series safely
    const dealsSeries = useMemo(
        () =>
            Array.isArray(charts?.dealsByMonth)
                ? charts.dealsByMonth.map((d) => ({
                    name: d?.ym ?? "",
                    value: Number(d?.total || 0),
                }))
                : [],
        [charts?.dealsByMonth]
    );

    const inquiriesSeries = useMemo(
        () =>
            Array.isArray(charts?.inquiriesThisMonth)
                ? charts.inquiriesThisMonth.map((d) => ({
                    name: d?.status ?? "",
                    value: Number(d?.cnt || 0),
                }))
                : [],
        [charts?.inquiriesThisMonth]
    );

    // Work queues (safe arrays)
    const pendingInquiries = Array.isArray(queues?.pendingInquiries)
        ? queues.pendingInquiries
        : [];
    const pendingDeals = Array.isArray(queues?.pendingDeals)
        ? queues.pendingDeals
        : [];
    const upcomingTrippings = Array.isArray(queues?.upcomingTrippings)
        ? queues.upcomingTrippings
        : [];

    // Date filters (align with admin pattern, optional)
    const onChangeDate = (name, value) => {
        router.get(
            route("broker.dashboard"),
            { ...filters, [name]: value },
            { preserveState: true, replace: true }
        );
    };

    const applyQuickRange = (days) => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days + 1);
        const pad = (x) => String(x).padStart(2, "0");
        const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(
            to.getDate()
        )}`;
        const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(
            from.getDate()
        )}`;
        router.get(
            route("broker.dashboard"),
            { ...filters, date_from: fromStr, date_to: toStr },
            { preserveState: true, replace: true }
        );
    };

    return (
        <BrokerLayout>
            <div className="px-4 py-6 md:px-6">
                {/* Header + date filters (mirrors admin style) */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Broker Dashboard</h1>
                        <p className="text-sm text-gray-600">
                            Snapshot of your brokerage performance and action items.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ToolbarButton onClick={() => applyQuickRange(7)}>Last 7 days</ToolbarButton>
                        <ToolbarButton onClick={() => applyQuickRange(30)}>Last 30 days</ToolbarButton>
                        <ToolbarButton onClick={() => applyQuickRange(90)}>Last 90 days</ToolbarButton>
                        <div className="w-px h-6 bg-gray-200 mx-1" />
                        <input
                            type="date"
                            value={filters?.date_from || ""}
                            onChange={(e) => onChangeDate("date_from", e.target.value)}
                            className="h-9 rounded border border-gray-300 px-2 text-sm bg-white"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                            type="date"
                            value={filters?.date_to || ""}
                            onChange={(e) => onChangeDate("date_to", e.target.value)}
                            className="h-9 rounded border border-gray-300 px-2 text-sm bg-white"
                        />
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                    <Kpi
                        icon={Home}
                        label="Listings"
                        value={kpi?.listings?.total ?? 0}
                        sub={`${kpi?.listings?.published ?? 0} published`}
                    />
                    <Kpi icon={MapPin} label="Pre-selling" value={kpi?.presell ?? 0} />
                    <Kpi
                        icon={MessageSquare}
                        label="Inquiries"
                        value={kpi?.inquiries?.total ?? 0}
                        sub={`${kpi?.inquiries?.pending ?? 0} pending`}
                    />
                    <Kpi
                        icon={Handshake}
                        label="Deals"
                        value={kpi?.deals?.total ?? 0}
                        sub={`${kpi?.deals?.pending ?? 0} pending`}
                    />
                    <Kpi icon={Wallet} label="Pipeline" value={money(kpi?.deals?.pipeline_value)} />
                    <Kpi
                        icon={Users}
                        label="Agents / Partners"
                        value={`${kpi?.agents ?? 0} / ${kpi?.partners ?? 0}`}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Deals value (last 12 months)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            {dealsSeries.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dealsSeries} margin={{ left: 10, right: 10 }}>
                                        <defs>
                                            <linearGradient id="gradDeals" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopOpacity={0.6} />
                                                <stop offset="95%" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis fontSize={12} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(v) => money(v)} />
                                        <Area type="monotone" dataKey="value" strokeWidth={2} fill="url(#gradDeals)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartNote />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inquiries (this month)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            {inquiriesSeries.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={inquiriesSeries} margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis fontSize={12} allowDecimals={false} />
                                        <Tooltip formatter={(v) => fmtInt(v)} />
                                        <Legend />
                                        <Bar dataKey="value" strokeWidth={1} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartNote />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Work queues */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Inquiries */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pending inquiries</CardTitle>
                            <Link href="/broker/inquiries" className="text-sm text-primary hover:underline">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y">
                                {pendingInquiries.map((q) => (
                                    <li key={q.id} className="py-3 flex items-start gap-3">
                                        <img
                                            src={
                                                q?.property?.image_url
                                                    ? `/storage/${q.property.image_url}`
                                                    : "/images/placeholder.jpg"
                                            }
                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                            alt=""
                                            className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {q?.property?.title || "Property"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{q?.notes || "—"}</p>
                                        </div>
                                        <Link href="/broker/inquiries" className="ml-auto text-sm text-primary">
                                            Reply
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {pendingInquiries.length === 0 && (
                                <p className="text-sm text-gray-500 py-2">Nothing pending 🎉</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Deals */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pending deals</CardTitle>
                            <Link href="/broker/deals" className="text-sm text-primary hover:underline">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y">
                                {pendingDeals.map((d) => (
                                    <li key={d.id} className="py-3 flex items-start gap-3">
                                        <img
                                            src={
                                                d?.property_listing?.property?.image_url
                                                    ? `/storage/${d.property_listing.property.image_url}`
                                                    : "/images/placeholder.jpg"
                                            }
                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                            alt=""
                                            className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {d?.property_listing?.property?.title || "Property"}
                                            </p>
                                            <p className="text-xs text-gray-500">{money(d?.amount)}</p>
                                        </div>
                                        <Link href="/broker/deals" className="ml-auto text-sm text-primary">
                                            Review
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {pendingDeals.length === 0 && (
                                <p className="text-sm text-gray-500 py-2">No pending deals.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Trippings */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Upcoming trippings</CardTitle>
                            <Link href="/broker/trippings" className="text-sm text-primary hover:underline">
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y">
                                {upcomingTrippings.map((t) => (
                                    <li key={t.id} className="py-3">
                                        <p className="text-sm font-medium text-gray-800">
                                            {t?.property_listing?.property?.title ||
                                                t?.property?.title ||
                                                "Property"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {fmtDateTime(t?.start_date, t?.start_time, t?.schedule_at)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            {upcomingTrippings.length === 0 && (
                                <p className="text-sm text-gray-500 py-2">No scheduled visits.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BrokerLayout>
    );
}
