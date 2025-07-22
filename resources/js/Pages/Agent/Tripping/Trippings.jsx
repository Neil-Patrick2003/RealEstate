import AgentLayout from "@/Layouts/AgentLayout.jsx";
import dayjs from "dayjs";
import MyCalendar from "@/Components/MyCalendar.jsx";
import { useState } from "react";
import { router } from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Trippings({ trippings }) {
    const today = dayjs().startOf("day");

    const pendingTrippings = trippings.filter(trip => trip.status === 'pending');
    const incomingTrippings = trippings
        .filter(trip => trip.status === 'accepted' && dayjs(trip.visit_date).isAfter(today))
        .sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date));
    const completedTrippings = trippings
        .filter(trip => trip.status === 'accepted' && dayjs(trip.visit_date).isBefore(today))
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    const scheduledTrippings = trippings.filter(trip => trip.status === 'accepted');

    const [selectedTrippingId, setSelectedTrippingId] = useState(null);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);
    const [openDeclineModal, setOpenDeclineModal] = useState(false);
    const [tab, setTab] = useState('incoming'); // incoming | completed | pending

    const handleAccept = () => {
        if (!selectedTrippingId) return;
        router.patch(`/agents/trippings/${selectedTrippingId}/accept`, {
            onSuccess: resetModalState,
        });
    };

    const handleDecline = () => {
        if (!selectedTrippingId) return;
        router.patch(`/agents/trippings/${selectedTrippingId}/decline`, {
            onSuccess: resetModalState,
        });
    };

    const resetModalState = () => {
        setSelectedTrippingId(null);
        setOpenAcceptModal(false);
        setOpenDeclineModal(false);
    };

    const getTabData = () => {
        if (tab === 'pending') return pendingTrippings;
        if (tab === 'completed') return completedTrippings;
        return incomingTrippings;
    };

    return (
        <AgentLayout>
            <div className="px-4 py-6 space-y-10">

                {/* Confirm Modals */}
                <ConfirmDialog
                    onConfirm={handleAccept}
                    confirmText="Accept"
                    cancelText="Cancel"
                    loading={false}
                    title="Accept Visit Schedule"
                    open={openAcceptModal}
                    setOpen={setOpenAcceptModal}
                    description="Are you sure you want to accept this visit?"
                />
                <ConfirmDialog
                    onConfirm={handleDecline}
                    confirmText="Decline"
                    cancelText="Cancel"
                    loading={false}
                    title="Decline Visit Schedule"
                    open={openDeclineModal}
                    setOpen={setOpenDeclineModal}
                    description="Are you sure you want to decline this visit?"
                />

                {/* Page Title */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-gray-800">Property Visit Schedule</h1>
                    <p className="text-gray-500 text-sm">Manage and review all upcoming, pending, and completed property visits.</p>
                </div>

                {/* Calendar Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <MyCalendar trippings={scheduledTrippings} />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Visit Management */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Manage Visits</h2>
                            <div className="flex gap-2">
                                {['pending', 'incoming', 'completed'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setTab(type)}
                                        className={`px-4 py-2 text-sm rounded-md capitalize transition-all ${
                                            tab === type ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visit Table */}
                        <div className="overflow-auto">
                            <table className="w-full text-sm text-gray-700">
                                <thead className="bg-gray-50 hidden md:table-header-group">
                                <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="p-4">#</th>
                                    <th className="p-4">Property</th>
                                    <th className="p-4">Buyer</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Visit Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {getTabData().length > 0 ? (
                                    getTabData().map((trip, index) => (
                                        <tr key={trip.id} className="hover:bg-gray-50 flex flex-col md:table-row">
                                            <td className="p-4 hidden md:table-cell">{index + 1}</td>

                                            {/* Property */}
                                            <td className="p-4 flex items-center gap-3">
                                                <img
                                                    src={`/storage/${trip.property.image_url}`}
                                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                                    alt={trip.property.title}
                                                    className="w-12 h-12 rounded object-cover border border-gray-200"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-800">{trip.property.title}</div>
                                                    <div className="text-xs text-gray-500">{trip.property.address}</div>
                                                </div>
                                            </td>

                                            {/* Buyer */}
                                            <td className="p-4">
                                                <div className="text-primary font-medium">{trip.buyer?.name}</div>
                                                <div className="text-xs text-gray-500">{trip.buyer?.email}</div>
                                            </td>

                                            {/* Status */}
                                            <td className="p-4 capitalize text-sm">{trip.status}</td>

                                            {/* Visit Date */}
                                            <td className="p-4 whitespace-nowrap">
                                                {dayjs(trip.visit_date).format("MMM D, YYYY")}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right space-x-2">
                                                {trip.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTrippingId(trip.id);
                                                                setOpenAcceptModal(true);
                                                            }}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm transition"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTrippingId(trip.id);
                                                                setOpenDeclineModal(true);
                                                            }}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="border border-primary text-primary px-3 py-1.5 rounded-md hover:bg-primary hover:text-white text-sm transition">
                                                        View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-400">
                                            No {tab} visits.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sidebar - Upcoming Visits */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Visits</h3>
                        {incomingTrippings.length > 0 ? (
                            incomingTrippings.slice(0, 5).map(trip => (
                                    <div key={trip.id} className="mb-5 last:mb-0 border-b pb-4">
                                        <div className="text-sm text-gray-500 mb-1">
                                            {dayjs(trip.visit_date).format("MMMM D, YYYY")} • {trip.visit_time ?? "Time TBD"}
                                        </div>
                                        <div className="font-medium text-gray-800 truncate">{trip.property.title}</div>
                                        <div className="text-xs text-gray-500">{trip.property.address}</div>

                                        {trip.buyer?.name && (
                                            <div className="text-xs text-gray-400 mt-1">With: {trip.buyer.name}</div>
                                        )}

                                        <div className="mt-2">
                                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                                {trip.status}
                                            </span>
                                        </div>
                                    </div>
                                ))

                        ) : (
                            <p className="text-sm text-gray-500">No upcoming visits.</p>
                        )}
                    </div>
                </div>
            </div>
        </AgentLayout>
    );
}
