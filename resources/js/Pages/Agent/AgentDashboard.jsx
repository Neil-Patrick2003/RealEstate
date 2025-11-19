// resources/js/Pages/Agent/AgentDashboard.jsx
import React, { useMemo } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/Card";
import { Link } from "@inertiajs/react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    Home, MessageSquare, MapPin, Clock, TrendingUp, Users,
    Eye, Star, Target, Zap, Calendar, BarChart3
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
    }).format((n || 0) / 100);

// Image URL helper
const getImageUrl = (path) => {
    if (!path) return "/images/placeholder.jpg";
    return path.startsWith('http') ? path : `/storage/${path}`;
};

// Enhanced KPI tile with dark mode
const Kpi = ({ icon: Icon, label, value, sub, trend, color = "primary", onClick }) => (
    <div
        role={onClick ? "button" : "article"}
        tabIndex={onClick ? 0 : -1}
        className={`card-hover p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 ${
            onClick ? 'cursor-pointer hover:scale-105 focus:ring-2 focus:ring-primary-200 focus:outline-none rounded-lg' : ''
        } dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750`}
        onClick={onClick}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        aria-label={onClick ? `${label}: ${value}. Click to view details` : `${label}: ${value}`}
    >
        <div className={`rounded-xl p-3 ${
            color === 'primary' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                color === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    color === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        } shrink-0`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide dark:text-gray-400">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate dark:text-white">{value}</p>
            {sub && (
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
                    {trend && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                            trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
                        </span>
                    )}
                </div>
            )}
        </div>
    </div>
);

// Performance Metric Card with dark mode
const PerformanceMetric = ({ icon: Icon, label, value, description, color = "primary" }) => (
    <div className="card p-4 text-center dark:bg-gray-800 dark:border-gray-700">
        <div className={`w-12 h-12 rounded-xl ${
            color === 'primary' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                color === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
        } flex items-center justify-center mx-auto mb-3`}>
            <Icon size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
    </div>
);

// Rating Display Component with dark mode
const RatingDisplay = ({ rating, reviewCount, size = "md" }) => {
    const sizeClasses = {
        sm: { stars: "h-3 w-3", text: "text-xs" },
        md: { stars: "h-4 w-4", text: "text-sm" },
        lg: { stars: "h-5 w-5", text: "text-base" }
    };

    if (rating == null) {
        return (
            <span className={`text-gray-400 ${sizeClasses[size].text}`}>No ratings yet</span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`${sizeClasses[size].stars} ${
                            i < Math.floor(rating)
                                ? "text-amber-400 fill-current dark:text-amber-500"
                                : i < Math.ceil(rating)
                                    ? "text-amber-300 dark:text-amber-400/60"
                                    : "text-gray-200 dark:text-gray-600"
                        }`}
                    />
                ))}
            </div>
            <span className={`text-gray-600 font-medium dark:text-gray-300 ${sizeClasses[size].text}`}>
                {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
        </div>
    );
};

// Safe Chart Component with Error Handling and dark mode
const SafeChart = ({ data, children, emptyMessage = "No data available" }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
};

// Chart wrapper with dark mode support
const ChartContainer = ({ children, title, icon: Icon }) => (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
                <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

// Dashboard Skeleton Component with dark mode
const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex-1">
                <div className="skeleton-text w-64 h-8 mb-2 dark:bg-gray-700"></div>
                <div className="skeleton-text w-48 h-4 dark:bg-gray-700"></div>
            </div>
            <div className="skeleton-text w-32 h-6 dark:bg-gray-700"></div>
        </div>

        {/* Performance Metrics skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4 text-center dark:bg-gray-800 dark:border-gray-700">
                    <div className="skeleton-circle w-12 h-12 mx-auto mb-3 dark:bg-gray-700"></div>
                    <div className="skeleton-text w-20 h-6 mx-auto mb-2 dark:bg-gray-700"></div>
                    <div className="skeleton-text w-16 h-4 mx-auto mb-1 dark:bg-gray-700"></div>
                    <div className="skeleton-text w-24 h-3 mx-auto dark:bg-gray-700"></div>
                </div>
            ))}
        </div>

        {/* Main KPIs skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="skeleton-circle w-12 h-12 shrink-0 dark:bg-gray-700"></div>
                    <div className="flex-1 min-w-0">
                        <div className="skeleton-text w-24 h-4 mb-2 dark:bg-gray-700"></div>
                        <div className="skeleton-text w-16 h-6 mb-1 dark:bg-gray-700"></div>
                        <div className="skeleton-text w-32 h-3 dark:bg-gray-700"></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(2)].map((_, i) => (
                <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <div className="skeleton-text w-32 h-5 dark:bg-gray-700"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                            <div className="skeleton-text w-40 h-4 dark:bg-gray-700"></div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Recent Activity skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className={`${i === 0 ? 'lg:col-span-2' : ''} dark:bg-gray-800 dark:border-gray-700`}>
                    <CardHeader>
                        <div className="skeleton-text w-40 h-5 dark:bg-gray-700"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex items-center gap-3 p-3">
                                    <div className="skeleton-circle w-12 h-12 dark:bg-gray-700"></div>
                                    <div className="flex-1">
                                        <div className="skeleton-text w-32 h-4 mb-1 dark:bg-gray-700"></div>
                                        <div className="skeleton-text w-24 h-3 dark:bg-gray-700"></div>
                                    </div>
                                    <div className="skeleton-text w-16 h-4 dark:bg-gray-700"></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

// Empty States with dark mode
const EmptyChart = () => (
    <div className="h-full w-full flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <BarChart3 className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2"/>
        <p>No chart data available</p>
    </div>
);

const EmptyList = ({ text }) => (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p>{text}</p>
    </div>
);

// Custom Tooltip for charts with dark mode
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AgentDashboard({
                                           filters = {},
                                           kpi = {},
                                           charts = {},
                                           queues = {},
                                           feedback = {},
                                           loading = false
                                       }) {
    // Memoized chart data processing
    const inquiriesTrend = useMemo(() =>
        (charts?.inquiriesByDay || []).map(d => ({
            name: d.d,
            inquiries: Number(d.cnt || 0),
        })), [charts?.inquiriesByDay]);

    const inquiriesByStatus = useMemo(() =>
        (charts?.inquiriesByStatus || []).map(d => ({
            name: d.status || "—",
            value: Number(d.cnt || 0),
        })), [charts?.inquiriesByStatus]);

    // Colors for charts with dark mode compatibility
    const STATUS_COLORS = {
        'Pending': '#f59e0b',
        'Accepted': '#10b981',
        'Closed': '#3b82f6',
        'Rejected': '#ef4444'
    };

    const recentInquiries = Array.isArray(queues?.recentInquiries) ? queues.recentInquiries : [];
    const trippings = Array.isArray(queues?.upcomingTrippings) ? queues.upcomingTrippings : [];
    const recentListings = Array.isArray(queues?.recentListings) ? queues.recentListings : [];

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="page-content">
                    <DashboardSkeleton />
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className='page-content'>
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                                Your performance metrics and activity summary
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {feedback.average && (
                                <RatingDisplay
                                    rating={feedback.average}
                                    reviewCount={feedback.total_reviews}
                                />
                            )}
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {filters?.date_from} → {filters?.date_to}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <PerformanceMetric
                        icon={Target}
                        label="Conversion Rate"
                        value={fmtPercent(kpi?.performance?.conversion_rate)}
                        description="Inquiries to deals"
                        color="success"
                    />
                    <PerformanceMetric
                        icon={Zap}
                        label="Response Rate"
                        value={fmtPercent(kpi?.performance?.response_rate)}
                        description="Inquiries responded"
                        color="primary"
                    />
                    <PerformanceMetric
                        icon={TrendingUp}
                        label="Growth"
                        value={fmtPercent(kpi?.inquiries?.growth)}
                        description="Inquiry growth"
                        color={kpi?.inquiries?.growth >= 0 ? "success" : "warning"}
                    />
                    <PerformanceMetric
                        icon={Star}
                        label="Rating"
                        value={feedback.average ? feedback.average.toFixed(1) : "—"}
                        description="Average rating"
                        color="primary"
                    />
                </div>

                {/* Main KPIs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <Kpi
                        icon={Home}
                        label="Assigned Listings"
                        value={fmtInt(kpi?.listings?.total)}
                        sub={`${fmtInt(kpi?.listings?.published)} published, ${fmtInt(kpi?.listings?.draft)} draft`}
                        trend={{ value: '+5%', direction: 'up' }}
                        onClick={() => window.location.href = '/agent/listings'}
                    />
                    <Kpi
                        icon={MessageSquare}
                        label="Active Inquiries"
                        value={fmtInt(kpi?.inquiries?.total)}
                        sub={`${fmtInt(kpi?.inquiries?.pending)} pending, ${fmtInt(kpi?.inquiries?.accepted)} accepted`}
                        trend={{ value: '+12%', direction: 'up' }}
                        onClick={() => window.location.href = '/agent/inquiries'}
                    />
                    <Kpi
                        icon={MapPin}
                        label="Property Visits"
                        value={fmtInt(kpi?.trippings?.total)}
                        sub={`${fmtInt(kpi?.trippings?.upcoming)} upcoming`}
                        onClick={() => window.location.href = '/agent/trippings'}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Inquiries Trend */}
                    <ChartContainer title="Inquiry Trends" icon={TrendingUp}>
                        <SafeChart data={inquiriesTrend} emptyMessage="No inquiry data available">
                            <AreaChart data={inquiriesTrend}>
                                <defs>
                                    <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280' }}
                                />
                                <YAxis
                                    fontSize={12}
                                    allowDecimals={false}
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="inquiries"
                                    stroke="#10b981"
                                    fill="url(#colorInquiries)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </SafeChart>
                    </ChartContainer>

                    {/* Inquiry Status Distribution */}
                    <ChartContainer title="Inquiry Status" icon={BarChart3}>
                        <SafeChart data={inquiriesByStatus} emptyMessage="No status data available">
                            <PieChart>
                                <Pie
                                    data={inquiriesByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {inquiriesByStatus.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={STATUS_COLORS[entry.name] || '#6b7280'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </SafeChart>
                    </ChartContainer>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Recent Inquiries */}
                    <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    Recent Inquiries
                                </CardTitle>
                                <Link
                                    href="/agent/inquiries"
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentInquiries.map((inquiry) => (
                                    <div key={inquiry.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <img
                                            src={getImageUrl(inquiry?.property?.image_url)}
                                            className="w-12 h-12 rounded-lg object-cover"
                                            alt={inquiry?.property?.title || 'Property image'}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {inquiry?.property?.title || 'Untitled Property'}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                From {inquiry?.buyer?.name || 'Unknown Buyer'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`badge ${
                                                inquiry.status === 'Pending' ? 'badge-warning' :
                                                    inquiry.status === 'Accepted' ? 'badge-success' :
                                                        'badge-secondary'
                                            } text-xs dark:border-0`}>
                                                {inquiry.status}
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : 'Unknown date'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recentInquiries.length === 0 && <EmptyList text="No recent inquiries" />}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Trips */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    Upcoming Visits
                                </CardTitle>
                                <Link
                                    href="/agent/trippings"
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {trippings.map((trip) => (
                                    <div key={trip.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-600 transition-colors">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {trip?.property?.title || 'Untitled Property'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {trip?.buyer?.name || 'Unknown Buyer'}
                                        </p>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-2">
                                            {trip.visit_date ? new Date(trip.visit_date).toLocaleDateString() : 'Scheduled'}
                                        </p>
                                    </div>
                                ))}
                                {trippings.length === 0 && <EmptyList text="No upcoming visits" />}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Listings */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <Home className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                Recent Listings
                            </CardTitle>
                            <Link
                                href="/agent/listings"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                View All
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentListings.map((listing) => (
                                <div key={listing.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow bg-white dark:bg-gray-800">
                                    <img
                                        src={getImageUrl(listing?.property?.image_url)}
                                        className="w-full h-32 object-cover rounded-md mb-3"
                                        alt={listing?.property?.title || 'Property image'}
                                    />
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                                        {listing?.property?.title || 'Untitled Property'}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                                        {listing?.property?.address || 'No address provided'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`badge ${
                                            listing.status === 'Published' ? 'badge-success' :
                                                listing.status === 'Draft' ? 'badge-secondary' :
                                                    'badge-warning'
                                        } text-xs dark:border-0`}>
                                            {listing.status}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Unknown date'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {recentListings.length === 0 && <EmptyList text="No recent listings" />}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
