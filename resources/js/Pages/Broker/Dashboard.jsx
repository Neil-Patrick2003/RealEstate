// resources/js/Pages/Broker/Dashboard/Index.jsx
import React, { useMemo } from "react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { router, Link } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    Wallet, Home, Users, MessageSquare, Handshake, MapPin,
    TrendingUp, Target, Clock, Activity
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

// --- helpers ---
const fmtInt = (n) =>
    new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n ?? 0);

const fmtPercent = (n) =>
    new Intl.NumberFormat("en-PH", {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(Number(n || 0) / 100);

const ToolbarButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
    >
        {children}
    </button>
);

const Kpi = ({ icon: Icon, label, value, sub, trend }) => (
    <div className="card card-hover p-4">
        <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
                {trend && (
                    <div className={`inline-flex items-center gap-1 text-xs mt-1 ${
                        trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </div>
    </div>
);

const PerformanceMetric = ({ icon: Icon, label, value, description }) => (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Icon size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{fmtPercent(value)}</div>
        <div className="text-xs text-gray-500">{description}</div>
    </div>
);

function EmptyChartNote() {
    return (
        <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            No data available for this period.
        </div>
    );
}

// Color palettes
const STATUS_COLORS = {
    'Pending': '#F59E0B',
    'Accepted': '#10B981',
    'Rejected': '#EF4444',
    'Cancelled': '#6B7280',
    'Published': '#10B981',
    'Unpublished': '#F59E0B',
    'Draft': '#6B7280'
};

const INQUIRY_TYPE_COLORS = {
    'Buyer Inquiry': '#3B82F6',
    'Seller Request': '#8B5CF6',
    'Internal Inquiry': '#F59E0B'
};

export default function Dashboard({
                                      filters = {},
                                      kpi = {},
                                      charts = {},
                                      queues = {},
                                  }) {
    // Build chart series safely
    const dealsSeries = useMemo(
        () =>
            Array.isArray(charts?.dealsByMonth)
                ? charts.dealsByMonth.map((d) => ({
                    name: d?.ym ?? "",
                    deals: Number(d?.total || 0),
                }))
                : [],
        [charts?.dealsByMonth]
    );

    const inquiriesSeries = useMemo(
        () =>
            Array.isArray(charts?.inquiriesByMonth)
                ? charts.inquiriesByMonth.map((d) => ({
                    name: d?.ym ?? "",
                    inquiries: Number(d?.total || 0),
                }))
                : [],
        [charts?.inquiriesByMonth]
    );

    const listingsByStatus = useMemo(
        () =>
            Array.isArray(charts?.listingsByStatus)
                ? charts.listingsByStatus.map((d) => ({
                    name: d?.status ?? "",
                    value: Number(d?.count || 0),
                    color: STATUS_COLORS[d?.status] || '#6B7280'
                }))
                : [],
        [charts?.listingsByStatus]
    );

    const inquiriesByType = useMemo(
        () =>
            Array.isArray(charts?.inquiriesByType)
                ? charts.inquiriesByType.map((d) => ({
                    name: d?.type ?? "",
                    value: Number(d?.count || 0),
                    color: INQUIRY_TYPE_COLORS[d?.type] || '#6B7280'
                }))
                : [],
        [charts?.inquiriesByType]
    );

    const conversionSeries = useMemo(
        () =>
            Array.isArray(charts?.conversionByMonth)
                ? charts.conversionByMonth.map((d) => ({
                    name: d?.ym ?? "",
                    rate: Number(d?.conversion_rate || 0),
                }))
                : [],
        [charts?.conversionByMonth]
    );

    // Work queues (safe arrays)
    const pendingInquiries = Array.isArray(queues?.pendingInquiries) ? queues.pendingInquiries : [];
    const pendingDeals = Array.isArray(queues?.pendingDeals) ? queues.pendingDeals : [];
    const upcomingTrippings = Array.isArray(queues?.upcomingTrippings) ? queues.upcomingTrippings : [];
    const recentActivity = Array.isArray(queues?.recentActivity) ? queues.recentActivity : [];

    // Date filters
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
        const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`;
        const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
        router.get(
            route("broker.dashboard"),
            { ...filters, date_from: fromStr, date_to: toStr },
            { preserveState: true, replace: true }
        );
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'inquiry': return MessageSquare;
            case 'deal': return Handshake;
            default: return Activity;
        }
    };

    const getStatusColor = (status) => {
        return STATUS_COLORS[status] || '#6B7280';
    };

    return (
        <AuthenticatedLayout>
            <div className="page-container">
                <div className="page-content space-y-6">
                    {/* Header */}
                    <div className="section">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 gradient-text">Broker Dashboard</h1>
                                <p className="section-description">
                                    Comprehensive overview of your brokerage performance and activities.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <ToolbarButton onClick={() => applyQuickRange(7)}>Last 7 days</ToolbarButton>
                                <ToolbarButton onClick={() => applyQuickRange(30)}>Last 30 days</ToolbarButton>
                                <ToolbarButton onClick={() => applyQuickRange(90)}>Last 90 days</ToolbarButton>
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <input
                                    type="date"
                                    value={filters?.date_from || ""}
                                    onChange={(e) => onChangeDate("date_from", e.target.value)}
                                    className="form-input text-sm h-9"
                                />
                                <span className="text-gray-500 text-sm">to</span>
                                <input
                                    type="date"
                                    value={filters?.date_to || ""}
                                    onChange={(e) => onChangeDate("date_to", e.target.value)}
                                    className="form-input text-sm h-9"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <PerformanceMetric
                            icon={Target}
                            label="Inquiry Response Rate"
                            value={kpi?.performance?.inquiry_response_rate || 0}
                            description="Percentage of inquiries with a response"
                        />
                        <PerformanceMetric
                            icon={TrendingUp}
                            label="Deal Conversion Rate"
                            value={kpi?.performance?.deal_conversion_rate || 0}
                            description="Inquiries converted to deals"
                        />
                        <PerformanceMetric
                            icon={Home}
                            label="Active Listing Rate"
                            value={kpi?.performance?.active_listing_rate || 0}
                            description="Published vs total listings"
                        />
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Kpi
                            icon={Home}
                            label="Total Listings"
                            value={kpi?.listings?.total ?? 0}
                            sub={`${kpi?.listings?.published ?? 0} active`}
                        />
                        <Kpi
                            icon={MapPin}
                            label="Pre-selling"
                            value={kpi?.presell ?? 0}
                        />
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
                        <Kpi
                            icon={Users}
                            label="Team Agents"
                            value={kpi?.agents ?? 0}
                        />
                        <Kpi
                            icon={Users}
                            label="Partners"
                            value={kpi?.partners ?? 0}
                        />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Deals & Inquiries Trend */}
                        <Card className="lg:col-span-2 xl:col-span-2">
                            <CardHeader>
                                <CardTitle>Deals & Inquiries Trend (Last 12 Months)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-80">
                                {dealsSeries.length || inquiriesSeries.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart margin={{ left: 10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis fontSize={12} allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                data={dealsSeries}
                                                dataKey="deals"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                                name="Deals"
                                            />
                                            <Line
                                                type="monotone"
                                                data={inquiriesSeries}
                                                dataKey="inquiries"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                name="Inquiries"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChartNote />
                                )}
                            </CardContent>
                        </Card>

                        {/* Listings by Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Listings by Status</CardTitle>
                            </CardHeader>
                            <CardContent className="h-80">
                                {listingsByStatus.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={listingsByStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {listingsByStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Listings']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChartNote />
                                )}
                            </CardContent>
                        </Card>

                        {/* Conversion Rate Trend */}
                        <Card className="xl:col-span-2">
                            <CardHeader>
                                <CardTitle>Conversion Rate Trend (Last 12 Months)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-80">
                                {conversionSeries.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={conversionSeries} margin={{ left: 10, right: 10 }}>
                                            <defs>
                                                <linearGradient id="gradConversion" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis fontSize={12} tickFormatter={(v) => `${v}%`} />
                                            <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                                            <Area type="monotone" dataKey="rate" stroke="#8B5CF6" fill="url(#gradConversion)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChartNote />
                                )}
                            </CardContent>
                        </Card>

                        {/* Inquiries by Type */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inquiries by Type</CardTitle>
                            </CardHeader>
                            <CardContent className="h-80">
                                {inquiriesByType.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={inquiriesByType}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {inquiriesByType.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Inquiries']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChartNote />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Work Queues & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Pending Inquiries */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Pending Inquiries</CardTitle>
                                <Link href="/broker/inquiries" className="btn btn-ghost btn-sm text-xs">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pendingInquiries.map((q) => (
                                        <div key={q.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                                            <img
                                                src={q?.property?.image_url ? `/storage/${q.property.image_url}` : "/images/placeholder.jpg"}
                                                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                                alt=""
                                                className="w-10 h-10 rounded object-cover border border-gray-200"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {q?.property?.title || "Property"}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{q?.notes || "—"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {pendingInquiries.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No pending inquiries 🎉</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pending Deals */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Pending Deals</CardTitle>
                                <Link href="/broker/deals" className="btn btn-ghost btn-sm text-xs">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pendingDeals.map((d) => (
                                        <div key={d.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                                            <img
                                                src={d?.property_listing?.property?.image_url ? `/storage/${d.property_listing.property.image_url}` : "/images/placeholder.jpg"}
                                                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                                alt=""
                                                className="w-10 h-10 rounded object-cover border border-gray-200"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {d?.property_listing?.property?.title || "Property"}
                                                </p>
                                                <p className="text-xs text-gray-500">{d?.buyer?.name || "Unknown Buyer"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {pendingDeals.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No pending deals</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Trippings */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Upcoming Visits</CardTitle>
                                <Link href="/broker/trippings" className="btn btn-ghost btn-sm text-xs">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcomingTrippings.map((t) => (
                                        <div key={t.id} className="p-2 rounded-lg hover:bg-gray-50 transition">
                                            <p className="text-sm font-medium text-gray-800">
                                                {t?.property?.title || "Property"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {t.visit_date} • {t.visit_time?.slice(0, 5) || "Time TBD"}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {t?.buyer?.name || "Unknown Buyer"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {upcomingTrippings.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No scheduled visits</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Recent Activity</CardTitle>
                                <Clock size={16} className="text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => {
                                        const Icon = getActivityIcon(activity.type);
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                                                <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                                                    <Icon size={14} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-800 capitalize">
                                                        {activity.type} {activity.status?.toLowerCase()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(activity.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {recentActivity.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
