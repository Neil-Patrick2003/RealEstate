// resources/js/Pages/Seller/Dashboard.jsx
import React from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx"; // reuse theme shell
import { Link } from "@inertiajs/react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Home, MessageSquare, Eye, ShoppingBag, MapPin } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

// helpers
const money = (n=0) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n||0);
const fmtInt = (n=0) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n||0);

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

export default function Dashboard({ kpi = {}, charts = {}, queues = {} }) {
    const propsSeries = (charts?.propertiesByMonth || []).map(d => ({ name: d.ym, value: Number(d.total||0) }));
    const inquiriesSeries = (charts?.inquiriesByMonth || []).map(d => ({ name: d.ym, value: Number(d.total||0) }));

    const recentProps = Array.isArray(queues?.recent_properties) ? queues.recent_properties : [];
    const recentInqs  = Array.isArray(queues?.recent_inquiries) ? queues.recent_inquiries : [];

    return (
        <AuthenticatedLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
                <p className="text-sm text-gray-600">Your listings, interest and traction at a glance.</p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                <Kpi icon={Home}         label="Total Properties" value={fmtInt(kpi?.total_properties)} sub={`${fmtInt(kpi?.sold_properties)} sold`} />
                <Kpi icon={MessageSquare}label="Inquiries"       value={fmtInt(kpi?.total_inquiries)} />
                <Kpi icon={Eye}          label="Total Views"     value={fmtInt(kpi?.total_views)} />
                <Kpi icon={ShoppingBag}  label="Sold"            value={fmtInt(kpi?.sold_properties)} />
                <Kpi icon={MapPin}       label="Accepted Inquiries" value={fmtInt(kpi?.inquiries_status?.Accepted)} sub={`${fmtInt(kpi?.inquiries_status?.Pending)} pending`} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 rounded-xl bg-white ring-1 ring-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">Properties added (last 12 months)</h3>
                    </div>
                    <div className="h-64">
                        {propsSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={propsSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} allowDecimals={false}/>
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" fill="#22c55e33" stroke="#16a34a" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </div>

                <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Inquiries received (last 12 months)</h3>
                    <div className="h-64">
                        {inquiriesSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inquiriesSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#0ea5e9" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Properties */}
                <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Recent Properties</h3>
                        <Link href="/seller/properties" className="text-sm text-primary">View all</Link>
                    </div>
                    <ul className="divide-y mt-2">
                        {recentProps.map(p => (
                            <li key={p.id} className="py-3 flex items-start gap-3">
                                <img
                                    src={p?.image_url ? `/storage/${p.image_url}` : "/images/placeholder.jpg"}
                                    onError={e => e.currentTarget.src="/images/placeholder.jpg"}
                                    className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                    alt=""
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{p?.title || "—"}</p>
                                    <p className="text-xs text-gray-500 truncate">{p?.address || "—"}</p>
                                    <p className="text-[11px] text-gray-500">{p?.status} • {p?.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</p>
                                </div>
                                <Link href={`/seller/properties/${p.id}`} className="ml-auto text-sm text-primary">Open</Link>
                            </li>
                        ))}
                        {recentProps.length === 0 && <EmptyList text="No recent properties." />}
                    </ul>
                </div>

                {/* Recent Inquiries */}
                <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Recent Inquiries</h3>
                        <Link href="/seller/inquiries" className="text-sm text-primary">View all</Link>
                    </div>
                    <ul className="divide-y mt-2">
                        {recentInqs.map(i => (
                            <li key={i.id} className="py-3 flex items-start gap-3">
                                <img
                                    src={i?.property?.image_url ? `/storage/${i.property.image_url}` : "/images/placeholder.jpg"}
                                    onError={e => e.currentTarget.src="/images/placeholder.jpg"}
                                    className="w-12 h-12 rounded object-cover ring-1 ring-gray-200"
                                    alt=""
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{i?.property?.title || "—"}</p>
                                    <p className="text-xs text-gray-500 truncate">{i?.agent?.name ? `Agent: ${i.agent.name}` : "—"}</p>
                                    <p className="text-[11px] text-gray-500">{i?.status} • {i?.created_at ? new Date(i.created_at).toLocaleString() : "—"}</p>
                                </div>
                                <Link href="/seller/inquiries" className="ml-auto text-sm text-primary">Reply</Link>
                            </li>
                        ))}
                        {recentInqs.length === 0 && <EmptyList text="No recent inquiries." />}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
