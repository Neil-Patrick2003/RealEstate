import AgentLayout from "@/Layouts/AgentLayout.jsx";
import dayjs from "dayjs";
import MyCalendar from "@/Components/MyCalendar.jsx";
import { useState } from "react";
import { router } from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Trippings({ trippings }) {
    const [selectedTrippingId, setSelectedTrippingId] = useState(null);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);
    const [openDeclineModal, setOpenDeclineModal] = useState(false);

    const incomingTrippings = trippings
        .filter(trip => trip.status === 'accepted')
        .sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date));

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

    return (
        <AgentLayout>
            <div className="px-4 py-6 space-y-6  mx-auto">
                {/* Modals */}
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

                {/* Header */}
                <h1 className="text-2xl font-semibold text-primary">Property Visit Schedule</h1>

                {/* Calendar Section */}
                <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
                    <MyCalendar trippings={trippings} />
                </div>

                {/* Management Section */}
                <h2 className="text-2xl font-semibold text-gray-800">Manage Scheduled Visits</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Trippings Table */}
                    <div className="md:col-span-2 bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
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
                            {trippings.length > 0 ? (
                                trippings.map((trip, index) => {
                                    const isPending = trip.status.toLowerCase() === 'pending';

                                    return (
                                        <tr key={trip.id} className="hover:bg-gray-50 flex flex-col md:table-row">
                                            <td className="p-4 md:text-center hidden md:table-cell">{index + 1}</td>

                                            {/* Property */}
                                            <td className="p-4 flex items-center gap-3">
                                                <img
                                                    src={`/storage/${trip.property.image_url}`}
                                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                                    alt={trip.property.title}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium">{trip.property.title}</div>
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
                                                {isPending ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTrippingId(trip.id);
                                                                setOpenAcceptModal(true);
                                                            }}
                                                            className="bg-primary text-white px-3 py-1.5 rounded-md hover:bg-green-600 text-sm"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTrippingId(trip.id);
                                                                setOpenDeclineModal(true);
                                                            }}
                                                            className="bg-secondary text-white px-3 py-1.5 rounded-md hover:bg-red-600 text-sm"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : trip.status === 'accepted' ? (
                                                    <button className="border border-primary text-primary px-3 py-1.5 rounded-md hover:bg-primary hover:text-white text-sm">
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 capitalize text-sm">{trip.status}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-400">
                                        No trippings found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Upcoming Visits Sidebar */}
                    <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Visits</h3>
                        {incomingTrippings.length > 0 ? (
                            incomingTrippings.map(trip => (
                                <div key={trip.id} className="mb-4 last:mb-0">
                                    <p className="text-sm text-gray-500">{dayjs(trip.visit_date).fromNow()}</p>
                                    <p className="font-medium text-gray-800">{dayjs(trip.visit_date).format("MMMM D, YYYY")}</p>
                                    <p className="text-xs text-gray-600 truncate">{trip.property.title}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No upcoming visits scheduled.</p>
                        )}
                    </div>
                </div>
            </div>
        </AgentLayout>
    );
}
