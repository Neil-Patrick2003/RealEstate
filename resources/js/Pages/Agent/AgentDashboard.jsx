// resources/js/Pages/Agents/AgentDashboard.jsx
import React from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";
import { Link } from "@inertiajs/react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Home, MessageSquare, MapPin, Clock } from "lucide-react";

// --- helpers ---
const fmtInt = (n) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n ?? 0);

// Theme-aligned KPI tile (Flat style, Green/Primary theme)
const Kpi = ({ icon: Icon, label, value, sub }) => (
    // Removed border, relying on bg-white and subtle shadow-sm (can be removed if layout background is darker)
    <div className="rounded-xl bg-white p-4 flex items-center gap-3 shadow-sm transition hover:shadow-md">
        {/* Primary Color Icon */}
        <div className="rounded-lg bg-green-100 p-3 text-green-600 shrink-0">
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 truncate">{value}</p> {/* Bolder value */}
            {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
    </div>
);

export default function AgentDashboard({ filters = {}, kpi = {}, charts = {}, queues = {} }) {
    // New chart series (no deals)
    const inquiriesTrend = (charts?.inquiriesByDay || []).map(d => ({
        name: d.d, value: Number(d.cnt || 0),
    }));
    const inquiriesByStatus = (charts?.inquiriesByStatus || []).map(d => ({
        name: d.status || "—", value: Number(d.cnt || 0),
    }));

    const recentInquiries = Array.isArray(queues?.recentInquiries) ? queues.recentInquiries : [];
    const trippings        = Array.isArray(queues?.upcomingTrippings) ? queues.upcomingTrippings : [];
    const recentListings   = Array.isArray(queues?.recentListings) ? queues.recentListings : [];

    return (
        // Assuming AgentLayout provides a light gray background (bg-gray-50) for contrast
        <AgentLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Dashboard Overview</h1> {/* Bolder header */}
                <p className="text-sm text-gray-600 mt-1">Your inquiries, listings, and schedule at a glance.</p>
            </div>

            {/* --- KPIs (no deals) --- */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <Kpi
                    icon={Home}
                    label="Assigned Listings"
                    value={fmtInt(kpi?.listings?.total)}
                    sub={`${fmtInt(kpi?.listings?.published)} published`}
                />
                <Kpi
                    icon={MessageSquare}
                    label="Active Inquiries"
                    value={fmtInt(kpi?.inquiries?.total)}
                    sub={`${fmtInt(kpi?.inquiries?.pending)} pending`}
                />
                <Kpi
                    icon={MapPin}
                    label="Upcoming Trips"
                    value={fmtInt(trippings.length)}
                    sub={`${fmtInt(kpi?.listings?.total)} total units`}
                />
            </div>

            {/* --- Charts (Flat cards) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Inquiries Trend (Area) - Primary/Green Theme */}
                {/* Removed border, relying on bg-white and subtle shadow-sm */}
                <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Inquiries Trend
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">({filters?.date_from} → {filters?.date_to})</p>
                    </div>
                    <div className="h-64 text-green-600">
                        {inquiriesTrend.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={inquiriesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Light gray grid */}
                                    <XAxis dataKey="name" fontSize={12} stroke="#6b7280" />
                                    <YAxis fontSize={12} allowDecimals={false} stroke="#6b7280" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="currentColor"
                                        fill="url(#colorGreen)"
                                        fillOpacity={1}
                                        strokeWidth={3}
                                    />
                                    <defs>
                                        <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                {/* Inquiries by Status (Bar) - Secondary/Orange Theme */}
                {/* Removed border, relying on bg-white and subtle shadow-sm */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Inquiry Statuses</h3>
                    <p className="text-xs text-gray-500 mb-4">Breakdown for this month</p>
                    <div className="h-64 text-orange-500">
                        {inquiriesByStatus.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inquiriesByStatus} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" fontSize={12} allowDecimals={false} stroke="#6b7280" />
                                    <YAxis type="category" dataKey="name" fontSize={12} stroke="#6b7280" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>
            </div>

            {/* --- Queues (Flat cards) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Inquiries */}
                <Card className="shadow-sm rounded-xl p-0 bg-white">
                    <CardHeader className="px-6 pt-6 pb-3 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900">Recent Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="divide-y divide-gray-100">
                            {recentInquiries.slice(0, 5).map((q) => (
                                <li key={q.id} className="py-4 flex items-start gap-4 hover:bg-gray-50 transition -mx-6 px-6">
                                    <img
                                        src={q?.property?.image_url ? `/storage/${q.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                        className="w-12 h-12 rounded-lg object-cover ring-2 ring-green-100 shrink-0"
                                        alt=""
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{q?.property?.title || "—"}</p>
                                        <p className="text-xs text-gray-600 truncate mt-0.5">from {q?.buyer?.name || "—"}</p>
                                        <p className="text-[11px] text-gray-400 mt-1">{new Date(q.created_at).toLocaleString()}</p>
                                    </div>
                                    <Link
                                        // href={route('agents.inquiries.show', q.id)}
                                        className="ml-auto text-sm font-medium text-green-600 hover:text-green-700 hover:underline shrink-0"
                                    >
                                        View
                                    </Link>
                                </li>
                            ))}
                            {recentInquiries.length === 0 && <EmptyList text="No recent inquiries." />}
                        </ul>
                    </CardContent>
                </Card>

                {/* Upcoming Trippings */}
                <Card className="shadow-sm rounded-xl p-0 bg-white">
                    <CardHeader className="px-6 pt-6 pb-3 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Trippings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="divide-y divide-gray-100">
                            {trippings.slice(0, 5).map((t) => (
                                <li key={t.id} className="py-4 flex items-start gap-4 hover:bg-gray-50 transition -mx-6 px-6">
                                    {/* Primary Color Icon/Indicator */}
                                    <div className="p-3 rounded-lg bg-green-100 text-green-600 shrink-0"><Clock size={18} /></div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{t?.property?.title || "Property visit"}</p>
                                        <p className="text-xs text-gray-700 truncate mt-0.5">Client: {t?.buyer?.name || "—"}</p>
                                        <p className="text-xs text-orange-500 font-medium mt-1"> {/* Highlight schedule in Secondary/Orange */}
                                            {t?.schedule_at
                                                ? new Date(t.schedule_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
                                                : `${t?.start_date || ""} ${String(t?.start_time || "").slice(0,5)}`}
                                        </p>
                                    </div>
                                    <span className='ml-auto text-xs font-medium text-gray-600 px-3 py-1 rounded-full bg-gray-100 shrink-0 self-center'>
                                        {t.status}
                                    </span>
                                </li>
                            ))}
                            {trippings.length === 0 && <EmptyList text="No scheduled trippings." />}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* --- Recent Listings (Table) --- */}
            <div className="mt-8">
                <Card className="shadow-sm rounded-xl p-0 bg-white">
                    <CardHeader className="px-6 pt-6 pb-3 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900">Recently Assigned Listings</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0"> {/* Removed CardContent padding */}
                        <table className="min-w-full text-sm">
                            <thead className="text-gray-700 bg-gray-50">
                            <tr>
                                <th className="p-4 text-left font-semibold">Property</th> {/* Increased padding */}
                                <th className="p-4 text-left font-semibold">Address</th>
                                <th className="p-4 text-left font-semibold">Status</th>
                                <th className="p-4 text-left font-semibold">Created</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {recentListings.map((l) => (
                                <tr key={l.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={l?.property?.image_url ? `/storage/${l.property.image_url}` : "/images/placeholder.jpg"}
                                                onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                                className="w-10 h-10 rounded-lg object-cover ring-1 ring-gray-200"
                                                alt=""
                                            />
                                            <span className="font-medium text-gray-900 truncate max-w-[200px]">
                                                {l?.property?.title || "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700">{l?.property?.address || "—"}</td>
                                    <td className="p-4">
                                        {/* Status Pill: Primary Color theme */}
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {l?.status || "—"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {l?.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}
                                    </td>
                                </tr>
                            ))}
                            {recentListings.length === 0 && (
                                <tr>
                                    <td className="p-4 text-gray-500" colSpan={4}>No recently assigned listings.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AgentLayout>
    );
}

// --- Empty States (Updated styles) ---
function EmptyChart() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg">
            <BarChart className="w-8 h-8 text-gray-300 mb-2"/>
            No data for the selected range.
        </div>
    );
}
function EmptyList({ text }) {
    return <p className="text-sm text-gray-500 py-3 text-center bg-gray-50 rounded-lg">{text}</p>;
}
