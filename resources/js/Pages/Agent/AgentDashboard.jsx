// resources/js/Pages/Agents/AgentDashboard.jsx
import React from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";
import { Link } from "@inertiajs/react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Wallet, Home, MessageSquare, Handshake, MapPin, Clock } from "lucide-react";

// --- helpers ---
const money = (n = 0) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n || 0);

const fmtInt = (n) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n ?? 0);

// Theme-aligned KPI tile
const Kpi = ({ icon: Icon, label, value, sub }) => (
    <div className="rounded-xl bg-white border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
            {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
    </div>
);

export default function AgentDashboard({ filters = {}, kpi = {}, charts = {}, queues = {} }) {
    const dealsSeries = (charts?.dealsByMonth || []).map(d => ({ name: d.ym, value: Number(d.total || 0) }));
    const inquiriesSeries = (charts?.inquiriesThisMonth || []).map(d => ({ name: d.status || "—", value: Number(d.cnt || 0) }));

    const recentInquiries = Array.isArray(queues?.recentInquiries) ? queues.recentInquiries : [];
    const pendingDeals     = Array.isArray(queues?.pendingDeals) ? queues.pendingDeals : [];
    const trippings        = Array.isArray(queues?.upcomingTrippings) ? queues.upcomingTrippings : [];
    const recentListings   = Array.isArray(queues?.recentListings) ? queues.recentListings : [];

    return (
        <AgentLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
                <p className="text-sm text-gray-600">Your pipeline, inquiries, and schedule at a glance.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <Kpi icon={Home}        label="Assigned Listings" value={fmtInt(kpi?.listings?.total)}   sub={`${fmtInt(kpi?.listings?.published)} published`} />
                <Kpi icon={MessageSquare} label="Inquiries"         value={fmtInt(kpi?.inquiries?.total)}  sub={`${fmtInt(kpi?.inquiries?.pending)} pending`} />
                <Kpi icon={Handshake}   label="Deals"              value={fmtInt(kpi?.deals?.total)}     sub={`${fmtInt(kpi?.deals?.pending)} pending`} />
                <Kpi icon={Wallet}      label="Pipeline"           value={money(kpi?.deals?.pipeline_value)} />
                <Kpi icon={Handshake}   label="Closed Deals"       value={fmtInt(kpi?.deals?.closed)}    sub={money(kpi?.deals?.closed_value)} />
                <Kpi icon={MapPin}      label="Upcoming Trips"     value={fmtInt(trippings.length)} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Deals value (Area) */}
                <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Deals value (last 12 months)</h3>
                    </div>
                    {/* Give the chart a theme color via currentColor */}
                    <div className="h-64 text-primary">
                        {dealsSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dealsSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(v)=>`₱${(v/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v)=>money(v)} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="currentColor"
                                        fill="currentColor"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                {/* Inquiries (Bar) */}
                <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Inquiries (this month)</h3>
                    <div className="h-64 text-secondary">
                        {inquiriesSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inquiriesSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="currentColor" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>
            </div>

            {/* Queues */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Inquiries */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Recent Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-100">
                            {recentInquiries.map((q) => (
                                <li key={q.id} className="py-3 flex items-start gap-3">
                                    <img
                                        src={q?.property?.image_url ? `/storage/${q.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                        className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                        alt=""
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{q?.property?.title || "—"}</p>
                                        <p className="text-xs text-gray-600 truncate">{q?.buyer?.name || "—"}</p>
                                        <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleString()}</p>
                                    </div>
                                    <Link href="/agents/inquiries" className="ml-auto text-sm text-primary hover:text-accent">Reply</Link>
                                </li>
                            ))}
                            {recentInquiries.length === 0 && <EmptyList text="No inquiries yet." />}
                        </ul>
                    </CardContent>
                </Card>

                {/* Pending Deals */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Pending Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-100">
                            {pendingDeals.map((d) => (
                                <li key={d.id} className="py-3 flex items-start gap-3">
                                    <img
                                        src={d?.property_listing?.property?.image_url ? `/storage/${d.property_listing.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                        className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                        alt=""
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {d?.property_listing?.property?.title || "—"}
                                        </p>
                                        <p className="text-xs text-gray-700">{money(d?.amount)}</p>
                                        <p className="text-[11px] text-gray-500">{d?.status}</p>
                                    </div>
                                    <Link href="/agents/deals" className="ml-auto text-sm text-primary hover:text-accent">Review</Link>
                                </li>
                            ))}
                            {pendingDeals.length === 0 && <EmptyList text="No pending deals." />}
                        </ul>
                    </CardContent>
                </Card>

                {/* Upcoming Trippings */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Upcoming Trippings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-100">
                            {trippings.map((t) => (
                                <li key={t.id} className="py-3 flex items-start gap-3">
                                    <div className="p-2 rounded bg-primary/10 text-primary"><Clock size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{t?.property?.title || "Property visit"}</p>
                                        <p className="text-xs text-gray-700">{t?.property?.address || "—"}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {t?.schedule_at
                                                ? new Date(t.schedule_at).toLocaleString()
                                                : `${t?.start_date || ""} ${String(t?.start_time || "").slice(0,5)}`}
                                        </p>
                                        <p className="text-[11px] text-gray-500">Buyer: {t?.buyer?.name || "—"}</p>
                                    </div>
                                </li>
                            ))}
                            {trippings.length === 0 && <EmptyList text="No scheduled trippings." />}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Listings */}
            <div className="mt-6">
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Recently Assigned Listings</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-gray-700 bg-gray-50">
                            <tr>
                                <th className="p-2 text-left font-semibold">Property</th>
                                <th className="p-2 text-left font-semibold">Address</th>
                                <th className="p-2 text-left font-semibold">Status</th>
                                <th className="p-2 text-left font-semibold">Created</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {recentListings.map((l) => (
                                <tr key={l.id} className="hover:bg-gray-50">
                                    <td className="p-2">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={l?.property?.image_url ? `/storage/${l.property.image_url}` : "/images/placeholder.jpg"}
                                                onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                                className="w-10 h-10 rounded object-cover ring-1 ring-gray-200"
                                                alt=""
                                            />
                                            <span className="font-medium text-gray-900">
                          {l?.property?.title || "—"}
                        </span>
                                        </div>
                                    </td>
                                    <td className="p-2 text-gray-700">{l?.property?.address || "—"}</td>
                                    <td className="p-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                        {l?.status || "—"}
                      </span>
                                    </td>
                                    <td className="p-2 text-gray-600">
                                        {l?.created_at ? new Date(l.created_at).toLocaleString() : "—"}
                                    </td>
                                </tr>
                            ))}
                            {recentListings.length === 0 && (
                                <tr>
                                    <td className="p-3 text-gray-500" colSpan={4}>No recent listings.</td>
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

function EmptyChart() {
    return (
        <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            No data for the selected range.
        </div>
    );
}
function EmptyList({ text }) {
    return <p className="text-sm text-gray-500 py-2">{text}</p>;
}
