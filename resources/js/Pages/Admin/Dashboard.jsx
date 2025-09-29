// resources/js/Pages/Admin/Dashboard.jsx
import React from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";

import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ----------------- helpers ----------------- */
const fmtInt = (n) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n ?? 0);
const fmtDate = (s) => (s ? new Date(s).toLocaleString() : "—");

const ToolbarButton = ({ active = false, children, onClick }) => (
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

/* Small icons (inline SVG so no extra deps) */
const UserIcon = (props) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" {...props}>
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.239-8 5v1h16v-1c0-2.761-3.58-5-8-5Z"/>
    </svg>
);
const HomeIcon = (props) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" {...props}>
        <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3Z"/>
    </svg>
);
const MailIcon = (props) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" {...props}>
        <path d="M20 4H4a2 2 0 0 0-2 2v1.2l10 6.25 10-6.25V6a2 2 0 0 0-2-2Zm0 5.3-8 5-8-5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"/>
    </svg>
);
const DealIcon = (props) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" {...props}>
        <path d="M12 1 3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-4Zm0 2.2L19 6v5c0 4.1-2.9 7.9-7 9-4.1-1.1-7-4.9-7-9V6l7-2.8ZM7 12h10v2H7v-2Z"/>
    </svg>
);

/* KPI card */
function Kpi({ icon, label, value, tint = "bg-gray-100 text-gray-700" }) {
    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${tint}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-semibold text-gray-900">{fmtInt(value)}</p>
            </div>
        </div>
    );
}

function EmptyChartNote() {
    return (
        <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            No data for the selected range.
        </div>
    );
}

/* Custom tooltip to keep numbers consistent */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md bg-white shadow ring-1 ring-gray-200 px-3 py-2 text-xs">
            <div className="font-medium text-gray-800">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="text-gray-600">{p.name || "value"}: <span className="font-semibold">{fmtInt(p.value)}</span></div>
            ))}
        </div>
    );
};

export default function AdminDashboard({
                                           filters = {},
                                           users = {},
                                           listings = {},
                                           inquiries = {},
                                           deals = {},
                                           series = {},
                                           top_brokers = [],
                                           recent_properties = [],
                                           recent_users = [],
                                           upcoming_trippings = [],
                                       }) {
    const onChangeDate = (name, value) => {
        router.get(route("admin.dashboard"), { ...filters, [name]: value }, { preserveState: true, replace: true });
    };

    const applyQuickRange = (days) => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days + 1);
        const pad = (x) => String(x).padStart(2, "0");
        const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`;
        const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
        router.get(route("admin.dashboard"), { ...filters, date_from: fromStr, date_to: toStr }, { preserveState: true, replace: true });
    };

    // normalize arrays
    const dailyListings = Array.isArray(series?.daily_listings) ? series.daily_listings : [];
    const dailyDeals = Array.isArray(series?.daily_deals) ? series.daily_deals : [];
    const brokers = Array.isArray(top_brokers) ? top_brokers : [];
    const properties = Array.isArray(recent_properties) ? recent_properties : [];
    const usersList = Array.isArray(recent_users) ? recent_users : [];
    const trippings = Array.isArray(upcoming_trippings) ? upcoming_trippings : [];

    return (
        <AdminLayout>
            <div className="px-4 py-6 md:px-6">
                {/* Header & date filters */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600">Platform-wide overview (users, listings, inquiries, deals).</p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Kpi icon={<UserIcon />} label="Users" value={users.total} tint="bg-emerald-50 text-emerald-700" />
                    <Kpi icon={<UserIcon />} label="Brokers" value={users.brokers} tint="bg-sky-50 text-sky-700" />
                    <Kpi icon={<UserIcon />} label="Agents" value={users.agents} tint="bg-indigo-50 text-indigo-700" />
                    <Kpi icon={<UserIcon />} label="Buyers" value={users.buyers} tint="bg-amber-50 text-amber-700" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <Kpi icon={<HomeIcon />} label="Properties" value={listings.properties_total} tint="bg-gray-100 text-gray-700" />
                    <Kpi icon={<HomeIcon />} label="Published" value={listings.published} tint="bg-green-50 text-green-700" />
                    <Kpi icon={<HomeIcon />} label="Unpublished" value={listings.unpublished} tint="bg-red-50 text-red-700" />
                    <Kpi icon={<MailIcon />} label="Inquiries (Pending)" value={inquiries.pending} tint="bg-yellow-50 text-yellow-700" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily New Listings</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            {dailyListings.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyListings} margin={{ left: 10, right: 10 }}>
                                        <defs>
                                            <linearGradient id="gradListings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopOpacity={0.55} />
                                                <stop offset="95%" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" fontSize={12} tickMargin={8} />
                                        <YAxis fontSize={12} allowDecimals={false} tickFormatter={fmtInt} width={48} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="value" strokeWidth={2} fill="url(#gradListings)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartNote />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daily New Deals</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            {dailyDeals.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyDeals} margin={{ left: 10, right: 10 }}>
                                        <defs>
                                            <linearGradient id="gradDeals" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopOpacity={0.55} />
                                                <stop offset="95%" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" fontSize={12} tickMargin={8} />
                                        <YAxis fontSize={12} allowDecimals={false} tickFormatter={fmtInt} width={48} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="value" strokeWidth={2} fill="url(#gradDeals)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartNote />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Brokers (Closed deals)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            {brokers.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={brokers} margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} tickMargin={8} />
                                        <YAxis fontSize={12} allowDecimals={false} tickFormatter={fmtInt} width={48} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend />
                                        <Bar dataKey="closed" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartNote />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Brokers (Published listings)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            {brokers.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={brokers} margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} tickMargin={8} />
                                        <YAxis fontSize={12} allowDecimals={false} tickFormatter={fmtInt} width={48} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend />
                                        <Bar dataKey="published" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartNote />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent / Upcoming */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-gray-600 bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 text-left">Property</th>
                                    <th className="p-2 text-left">Address</th>
                                    <th className="p-2 text-left">Created</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed">
                                {properties.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-2">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={p.image_url ? `/storage/${p.image_url}` : "/images/placeholder.jpg"}
                                                    onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                                    className="w-10 h-10 rounded object-cover ring-1 ring-gray-200"
                                                    alt={p.title}
                                                />
                                                <span className="font-medium text-gray-800">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-2 text-gray-700">{p.address || "—"}</td>
                                        <td className="p-2 text-gray-600">{fmtDate(p.created_at)}</td>
                                    </tr>
                                ))}
                                {properties.length === 0 && (
                                    <tr>
                                        <td className="p-3 text-gray-500" colSpan="3">No recent properties.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Trippings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {trippings.map((t) => (
                                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg ring-1 ring-gray-100">
                                    <img
                                        src={t?.property?.image_url ? `/storage/${t.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                        className="w-12 h-12 rounded object-cover"
                                        alt=""
                                    />
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-800">{t?.property?.title || "Property"}</div>
                                        <div className="text-gray-600">{t?.property?.address || "—"}</div>
                                        <div className="text-gray-500 mt-1">
                                            {t.start_date} • {(t.start_time || "").slice(0, 5)}
                                        </div>
                                        <div className="text-xs text-gray-500">Buyer: {t?.buyer?.name || "—"}</div>
                                    </div>
                                </div>
                            ))}
                            {trippings.length === 0 && (
                                <div className="text-sm text-gray-500">No scheduled trippings.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent users */}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-gray-600 bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Email</th>
                                    <th className="p-2 text-left">Role</th>
                                    <th className="p-2 text-left">Joined</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed">
                                {usersList.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="p-2 font-medium text-gray-800">{u.name}</td>
                                        <td className="p-2 text-gray-700">{u.email}</td>
                                        <td className="p-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {u.role}
                        </span>
                                        </td>
                                        <td className="p-2 text-gray-600">{fmtDate(u.created_at)}</td>
                                    </tr>
                                ))}
                                {usersList.length === 0 && (
                                    <tr>
                                        <td className="p-3 text-gray-500" colSpan="4">No recent signups.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
