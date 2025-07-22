import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Head, Link } from "@inertiajs/react";
import ApexChart from "@/Components/Charts/ApexChart.jsx";
import Piechart from "@/Components/Charts/Piechart.jsx";
import ColumnChart from "@/Components/Charts/ColumnChart.jsx";
import RecentFeedbacks from "@/Components/RecentFeedbacks.jsx";
import dayjs from "dayjs";

export default function AgentDashboard({ properties, inquiries, chartData, incoming_tripping, recent_inquiries, feedbacks }) {
    const totalListings = properties.length;
    const pendingCount = inquiries.filter(i => i.status === 'pending').length;

    const availableCount = properties.filter(p => p.status === 'Published').length;
    const soldCount = properties.filter(p => p.status === 'Sold').length;
    const assignedCount = properties.filter(p => p.status === 'Assigned').length;

    const PieSeries = [availableCount, soldCount, assignedCount];
    const labels = ['Available', 'Sold', 'Screening'];
    const colors = ['#719440', '#E0B52B', '#2D7DFD'];

    const inquiriesByMonth = inquiries.reduce((acc, i) => {
        const m = dayjs(i.created_at).format('MMM');
        acc[m] = (acc[m] || 0) + 1;
        return acc;
    }, {});
    const seriesInq = [{ name: "Inquiries", data: Object.values(inquiriesByMonth) }];
    const categoriesInq = Object.keys(inquiriesByMonth);

    const soldByMonth = properties.filter(p => p.status === 'Sold' && p.sold_at)
        .reduce((acc, p) => {
            const d = new Date(p.sold_at);
            const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {});
    const keys = Object.keys(soldByMonth).sort();
    const seriesSold = [{ name: "Sold Properties", data: keys.map(k => soldByMonth[k]) }];
    const categoriesSold = keys.map(k => {
        const [yr, m] = k.split('-');
        return new Date(`${yr}-${m}-01`).toLocaleString('default',{ month:'short', year:'numeric' });
    });

    const statusStyles = {
        Accepted: "bg-green-100 text-green-700 ring-green-200",
        Cancelled: "bg-red-100 text-red-700 ring-red-200",
        pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
        default: "bg-orange-100 text-orange-700 ring-orange-200",
    };

    return (
        <AgentLayout>
            <Head title="Dashboard" />

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-6">
                {[
                    {
                        label: 'Total Listings',
                        count: totalListings,
                        icon: '🏘️',
                        from: 'from-green-200',
                        to: 'to-green-100',
                        text: 'text-green-900',
                    },
                    {
                        label: 'Published',
                        count: availableCount,
                        icon: '📢',
                        from: 'from-purple-200',
                        to: 'to-purple-100',
                        text: 'text-purple-900',
                    },
                    {
                        label: 'Pending Inquiries',
                        count: pendingCount,
                        icon: '⏳',
                        from: 'from-yellow-200',
                        to: 'to-yellow-100',
                        text: 'text-yellow-900',
                    },
                    {
                        label: 'Incoming Trippings',
                        count: incoming_tripping,
                        icon: '📅',
                        from: 'from-orange-200',
                        to: 'to-orange-100',
                        text: 'text-orange-900',
                    },
                ].map((card, i) => (
                    <div
                        key={i}
                        className={`relative overflow-hidden flex flex-col gap-4 p-6 rounded-xl shadow-md bg-gradient-to-tl ${card.from} ${card.to}`}
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-2xl shadow">
                            {card.icon}
                        </div>

                        {/* Content */}
                        <div className="mt-2">
                            <p className={`text-sm font-medium ${card.text}`}>{card.label}</p>
                            <p className={`text-3xl font-bold ${card.text}`}>{card.count}</p>
                        </div>

                        {/* Faint large icon in background */}
                        <div className="absolute right-2 bottom-2 text-6xl opacity-10 pointer-events-none select-none">
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>



            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mt-6">
                <div className="bg-white shadow rounded-lg p-4 col-span-1">
                    <h2 className="text-lg font-semibold mb-2">Property Status</h2>
                    <Piechart series={PieSeries} labels={labels} colors={colors} width="100%" />
                </div>
                <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
                    <h2 className="text-lg font-semibold mb-2">Monthly Inquiries</h2>
                    <ColumnChart series={seriesInq} categories={categoriesInq} title="Inquiries" />
                </div>
                <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
                    <h2 className="text-lg font-semibold mb-2">Monthly Sales</h2>
                    {chartData?.categories ? (
                        <ApexChart categories={chartData.categories} series={chartData.series} />
                    ) : <p>Loading chart data...</p>}
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">Inquiries Distribution</h2>
                    <ColumnChart series={seriesSold} categories={categoriesSold} title="Sold" />
                </div>
            </div>

            {/* Recent Inquiries & Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mt-6">
                {/* Recent Inquiries - spans 2 columns */}
                <div className="md:col-span-2 bg-white shadow rounded-lg overflow-x-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-2">Pending Inquiries</h2>
                    </div>
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                        <tr>
                            <th className="p-3">Property</th>
                            <th className="p-3">Buyer</th>
                            <th className="p-3">Message</th>
                            <th className="p-3">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {recent_inquiries?.length > 0 ? recent_inquiries.map(inq => {
                            const prop = inq.property;
                            const sts = statusStyles[inq.status] || statusStyles.default;
                            const latestMsg = inq.latestMessage?.content || inq.messages?.[0]?.content || '';
                            return (
                                <tr key={inq.id} className="hover:bg-gray-50 flex flex-col md:table-row">
                                    <td className="p-3 md:table-cell">
                                        <div className="flex items-center gap-3">
                                            <img src={`/storage/${prop?.image_url}`} alt={prop?.title} className="w-14 h-14 object-cover rounded-md" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{prop?.title}</p>
                                                <p className="text-xs text-gray-500">{prop?.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 md:table-cell">
                                        <div className="flex items-center space-x-3">
                                            {inq.buyer?.profile_photo_url ? (
                                                <img src={inq.buyer.profile_photo_url} alt={inq.buyer.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-primary rounded-full text-white flex items-center justify-center font-bold uppercase">
                                                    {inq.buyer?.name?.charAt(0) || "?"}
                                                </div>
                                            )}
                                            <p className="text-gray-800 font-medium">{inq.buyer?.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 md:table-cell max-w-xs truncate">{latestMsg}</td>
                                    <td className="p-3 md:table-cell">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${sts}`}>
                                    {inq.status === 'Accepted' ? 'Accepted – Paperwork' : inq.status}
                                </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-gray-400">No recent inquiries.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <div className="p-4 text-right">
                        <Link className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                </div>

                {/* Feedback - 1 column */}
                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Feedback</h2>
                    <RecentFeedbacks feedbacks={feedbacks} />
                </div>
            </div>

        </AgentLayout>
    );
}
