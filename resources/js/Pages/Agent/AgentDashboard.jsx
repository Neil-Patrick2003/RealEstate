import React from "react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx"; // reuse theme; swap to AgentLayout if you have one
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";
import { Link } from "@inertiajs/react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Wallet, Home, MessageSquare, Handshake, MapPin, Clock } from "lucide-react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";

// --- helpers ---
const money = (n=0) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n || 0);

const fmtInt = (n) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n ?? 0);

const Kpi = ({ icon: Icon, label, value, sub }) => (
    <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4 flex items-center gap-3">
        <div className="rounded-lg bg-green-50 p-2 text-primary"><Icon size={20} /></div>
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
                <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>
                <p className="text-sm text-gray-600">Your pipeline, inquiries, and schedule at a glance.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <Kpi icon={Home} label="Assigned Listings" value={fmtInt(kpi?.listings?.total)} sub={`${fmtInt(kpi?.listings?.published)} published`} />
                <Kpi icon={MessageSquare} label="Inquiries" value={fmtInt(kpi?.inquiries?.total)} sub={`${fmtInt(kpi?.inquiries?.pending)} pending`} />
                <Kpi icon={Handshake} label="Deals" value={fmtInt(kpi?.deals?.total)} sub={`${fmtInt(kpi?.deals?.pending)} pending`} />
                <Kpi icon={Wallet} label="Pipeline" value={money(kpi?.deals?.pipeline_value)} />
                <Kpi icon={Handshake} label="Closed Deals" value={fmtInt(kpi?.deals?.closed)} sub={money(kpi?.deals?.closed_value)} />
                <Kpi icon={MapPin} label="Upcoming Trips" value={fmtInt(trippings.length)} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 rounded-xl bg-white ring-1 ring-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">Deals value (last 12 months)</h3>
                    </div>
                    <div className="h-64">
                        {dealsSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dealsSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(v)=>`₱${(v/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v)=>money(v)} />
                                    <Area type="monotone" dataKey="value" fill="#22c55e33" stroke="#16a34a" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Inquiries (this month)</h3>
                    <div className="h-64">
                        {inquiriesSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inquiriesSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#0ea5e9" />
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
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {recentInquiries.map((q) => (
                                <li key={q.id} className="py-3 flex items-start gap-3">
                                    <img
                                        src={q?.property?.image_url ? `/storage/${q.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                        className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                        alt=""
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{q?.property?.title || "—"}</p>
                                        <p className="text-xs text-gray-500 truncate">{q?.buyer?.name || "—"}</p>
                                        <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleString()}</p>
                                    </div>
                                    <Link href="/inquiries" className="ml-auto text-sm text-primary">Reply</Link>
                                </li>
                            ))}
                            {recentInquiries.length === 0 && <EmptyList text="No inquiries yet." />}
                        </ul>
                    </CardContent>
                </Card>

                {/* Pending Deals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {pendingDeals.map((d) => (
                                <li key={d.id} className="py-3 flex items-start gap-3">
                                    <img
                                        src={d?.property_listing?.property?.image_url ? `/storage/${d.property_listing.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                        className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                        alt=""
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {d?.property_listing?.property?.title || "—"}
                                        </p>
                                        <p className="text-xs text-gray-500">{money(d?.amount)}</p>
                                        <p className="text-[11px] text-gray-500">{d?.status}</p>
                                    </div>
                                    <Link href="/deals" className="ml-auto text-sm text-primary">Review</Link>
                                </li>
                            ))}
                            {pendingDeals.length === 0 && <EmptyList text="No pending deals." />}
                        </ul>
                    </CardContent>
                </Card>

                {/* Upcoming Trippings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Trippings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {trippings.map((t) => (
                                <li key={t.id} className="py-3 flex items-start gap-3">
                                    <div className="p-2 rounded bg-green-50 text-primary"><Clock size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800">{t?.property?.title || "Property visit"}</p>
                                        <p className="text-xs text-gray-600">{t?.property?.address || "—"}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {/* support schedule_at or start_date/start_time */}
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
                <Card>
                    <CardHeader>
                        <CardTitle>Recently Assigned Listings</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-gray-600 bg-gray-50">
                            <tr>
                                <th className="p-2 text-left">Property</th>
                                <th className="p-2 text-left">Address</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Created</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
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
                                            <span className="font-medium text-gray-800">
                          {l?.property?.title || "—"}
                        </span>
                                        </div>
                                    </td>
                                    <td className="p-2 text-gray-700">{l?.property?.address || "—"}</td>
                                    <td className="p-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
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
