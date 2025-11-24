// resources/js/Pages/Seller/Dashboard.jsx
import React from "react";
import { Link } from "@inertiajs/react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Home, MessageSquare, Eye, ShoppingBag, MapPin, TrendingUp, Users, Calendar, PieChart as PieChartIcon, Clock, AlertCircle } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

// helpers
const money = (n=0) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n||0);
const fmtInt = (n=0) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n||0);

const Kpi = ({ icon: Icon, label, value, sub, trend }) => (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
                {sub && (
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{sub}</p>
                        {trend && (
                            <span className={`inline-flex items-center text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp size={14} className={trend > 0 ? '' : 'rotate-180'} />
                                {Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 text-primary">
                <Icon size={24} />
            </div>
        </div>
    </div>
);

function EmptyChart() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 py-8">
            <Calendar size={48} className="mb-2 opacity-50" />
            <p className="text-sm">No data for the selected range</p>
        </div>
    );
}

function EmptyList({ text, icon: Icon }) {
    return (
        <div className="text-center py-8">
            {Icon && <Icon size={48} className="mx-auto mb-2 text-gray-300" />}
            <p className="text-sm text-gray-500">{text}</p>
        </div>
    );
}

// Custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// Format date to relative time
const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
};

export default function Dashboard({ kpi = {}, charts = {}, queues = {} }) {
    const propsSeries = (charts?.propertiesByMonth || []).map(d => ({ name: d.ym, value: Number(d.total||0) }));
    const inquiriesSeries = (charts?.inquiriesByMonth || []).map(d => ({ name: d.ym, value: Number(d.total||0) }));
    const inquiryStatusData = charts?.inquiryStatusDistribution || [];

    const recentPendingInqs = Array.isArray(queues?.recent_pending_inquiries) ? queues.recent_pending_inquiries : [];
    const recentInqs  = Array.isArray(queues?.recent_inquiries) ? queues.recent_inquiries : [];

    return (
        <AuthenticatedLayout>
            {/* Header */}
            <div className="mb-8 pt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                        <p className="text-gray-600 mt-2">Your listings, interest and traction at a glance</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2">
                            <Calendar size={16} />
                            <span>Last updated: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <Kpi
                    icon={Home}
                    label="Total Properties"
                    value={fmtInt(kpi?.total_properties)}
                    sub={`${fmtInt(kpi?.sold_properties)} sold`}
                />
                <Kpi
                    icon={MessageSquare}
                    label="Inquiries"
                    value={fmtInt(kpi?.total_inquiries)}
                    sub="This month"
                />
                <Kpi
                    icon={Eye}
                    label="Total Views"
                    value={fmtInt(kpi?.total_views)}
                    sub="All time"
                />
                <Kpi
                    icon={ShoppingBag}
                    label="Properties Sold"
                    value={fmtInt(kpi?.sold_properties)}
                />
                <Kpi
                    icon={Users}
                    label="Accepted Inquiries"
                    value={fmtInt(kpi?.inquiries_status?.Accepted)}
                    sub={`${fmtInt(kpi?.inquiries_status?.Pending)} pending`}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Properties Chart */}
                <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Properties Added</h3>
                            <p className="text-sm text-gray-600">Last 12 months performance</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-3 py-1">
                            <TrendingUp size={16} />
                            <span>Growth</span>
                        </div>
                    </div>
                    <div className="h-72">
                        {propsSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={propsSeries}>
                                    <defs>
                                        <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        fontSize={12}
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#16a34a"
                                        strokeWidth={3}
                                        fill="url(#colorProperties)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </div>

                {/* Inquiry Status Distribution Pie Chart */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Inquiry Status</h3>
                            <p className="text-sm text-gray-600">Distribution by status</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                            <PieChartIcon size={16} />
                        </div>
                    </div>
                    <div className="h-72">
                        {inquiryStatusData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={inquiryStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {inquiryStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [`${value} inquiries`, 'Count']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry) => (
                                            <span style={{ color: '#374151', fontSize: '12px' }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>
            </div>

            {/* Second Row Charts - Inquiries Trend */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Inquiries Trend Line Chart */}
                <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Inquiries Trend</h3>
                            <p className="text-sm text-gray-600">Last 12 months trend analysis</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-1">
                            <TrendingUp size={16} />
                            <span>Trend</span>
                        </div>
                    </div>
                    <div className="h-72">
                        {inquiriesSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={inquiriesSeries}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        fontSize={12}
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#0ea5e9"
                                        strokeWidth={3}
                                        dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#0ea5e9' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Pending Inquiries</span>
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                {fmtInt(kpi?.inquiries_status?.Pending)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Accepted Inquiries</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {fmtInt(kpi?.inquiries_status?.Accepted)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Rejected Inquiries</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {fmtInt(kpi?.inquiries_status?.Rejected)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Cancelled Inquiries</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                {fmtInt(kpi?.inquiries_status?.Cancelled)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Pending Inquiries */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">Pending Inquiries</h3>
                            {recentPendingInqs.length > 0 && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                    {recentPendingInqs.length} waiting
                                </span>
                            )}
                        </div>
                        <Link
                            href="/seller/inquiries"
                            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-colors"
                        >
                            Manage all
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentPendingInqs.map(i => (
                            <div key={i.id} className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors group">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={i?.property?.image_url ? `/storage/${i.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={e => e.currentTarget.src="/images/placeholder.jpg"}
                                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-200 group-hover:ring-amber-300 transition-all"
                                        alt=""
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{i?.property?.title || "Unknown Property"}</p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {i?.agent?.name ? `By ${i.agent.name}` : "No agent info"}
                                    </p>
                                    {i?.message && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{i.message}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                            <Clock size={12} className="mr-1" />
                                            Pending
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {getRelativeTime(i?.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href="/seller/inquiries"
                                    className="flex-shrink-0 text-primary hover:text-primary/80 font-medium text-sm transition-colors bg-white px-3 py-2 rounded-lg border border-primary/20 hover:border-primary/40"
                                >
                                    View
                                </Link>
                            </div>
                        ))}
                        {recentPendingInqs.length === 0 && (
                            <EmptyList
                                text="No pending inquiries"
                                icon={AlertCircle}
                            />
                        )}
                    </div>
                </div>

                {/* Recent Inquiries (All) */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
                        <Link
                            href="/seller/inquiries"
                            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-colors"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentInqs.map(i => (
                            <div key={i.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={i?.property?.image_url ? `/storage/${i.property.image_url}` : "/images/placeholder.jpg"}
                                        onError={e => e.currentTarget.src="/images/placeholder.jpg"}
                                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all"
                                        alt=""
                                    />
                                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                        i?.status === 'Accepted' ? 'bg-green-500' :
                                            i?.status === 'Pending' ? 'bg-amber-500' : 'bg-gray-400'
                                    }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{i?.property?.title || "Unknown Property"}</p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {i?.agent?.name ? `By ${i.agent.name}` : "No agent info"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            i?.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                i?.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                            {i?.status || 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {getRelativeTime(i?.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href="/seller/inquiries"
                                    className="flex-shrink-0 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                >
                                    Reply
                                </Link>
                            </div>
                        ))}
                        {recentInqs.length === 0 && <EmptyList text="No recent inquiries" />}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
