import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Head } from "@inertiajs/react";
import ApexChart from "@/Components/Charts/ApexChart.jsx";

export default function AgentDashboard({ properties, inquiries, chartData }) {
    const totalListings = properties.length;

    const publishedListings = properties.filter(p => p.status === 'Published').length;

    const assignedListings = properties.filter(p => p.status === 'Assigned').length;

    return (
        <AgentLayout>
            <Head title="Dashboard" />

            {/* Card Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-4 px-6 py-4 shadow-sm border border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-semibold text-sm">Total Listing</p>
                    <p className="text-3xl font-bold text-primary">{totalListings}</p>
                    {/* Icon SVG here (optional) */}
                </div>

                <div className="flex flex-col gap-4 px-6 py-4 shadow-sm border border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-semibold text-sm">Published</p>
                    <p className="text-3xl font-bold text-primary">{publishedListings}</p>
                    {/* Icon SVG here (optional) */}
                </div>

                <div className="flex flex-col gap-4 px-6 py-4 shadow-sm border border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-semibold text-sm">Unpublished</p>
                    <p className="text-3xl font-bold text-primary">{assignedListings}</p>
                    {/* Icon SVG here (optional) */}
                </div>
            </div>

            {/* Chart Section */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
                {chartData && chartData.categories && chartData.series ? (
                    <ApexChart categories={chartData.categories} series={chartData.series} />
                ) : (
                    <p>Loading chart data...</p>
                )}
            </div>
        </AgentLayout>
    );
}
