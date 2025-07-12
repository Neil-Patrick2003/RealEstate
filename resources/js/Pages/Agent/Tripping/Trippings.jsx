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
            <div className="px-4 py-6 space-y-6">
                {/* Accept Modal */}
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

                {/* Decline Modal */}
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

                <h1 className="text-primary text-xl font-bold">Property Visit Schedule</h1>

                {/* Calendar Section */}
                <div className="bg-white shadow rounded-lg p-4">
                    <MyCalendar trippings={trippings} />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Trippings Table */}
                    <div className="col-span-2 overflow-x-auto bg-white shadow rounded-lg">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase hidden md:table-header-group">
                            <tr>
                                <th className="p-3 text-center">
                                    <input type="checkbox" className="rounded border-gray-400" />
                                </th>
                                <th className="p-3">Property</th>
                                <th className="p-3">Buyer</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Visit Date</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {trippings.length > 0 ? (
                                trippings.map(trip => {
                                    const isPending = trip.status.toLowerCase() === 'pending';

                                    return (
                                        <tr
                                            key={trip.id}
                                            className="hover:bg-gray-50 flex flex-col md:table-row"
                                        >
                                            <td className="p-3 text-center hidden md:table-cell">
                                                <input type="checkbox" className="rounded border-gray-400" />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`/storage/${trip.property.image_url}`}
                                                        alt={trip.property.title}
                                                        onError={(e) => (e.target.src = "/placeholder.png")}
                                                        className="w-14 h-14 rounded-md object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{trip.property.title}</p>
                                                        <p className="text-xs text-gray-500">{trip.property.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <p className="text-primary hover:underline cursor-pointer">
                                                    {trip.buyer?.name}
                                                </p>
                                                <p className="text-xs">{trip.buyer?.email}</p>
                                            </td>
                                            <td className="p-3 capitalize">{trip.status}</td>
                                            <td className="p-3 whitespace-nowrap">
                                                {dayjs(trip.visit_date).format("MMMM D, YYYY")}
                                            </td>
                                            <td className="p-3 text-right space-x-2">
                                                {isPending ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTrippingId(trip.id);
                                                                setOpenAcceptModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTrippingId(trip.id);
                                                                setOpenDeclineModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark focus:outline-none"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : trip.status === 'accepted' ? (
                                                    <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white">
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="capitalize text-gray-500">{trip.status}</span>
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
                    <div className="bg-white shadow rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-primary mb-4">Upcoming Visits</h2>

                        {incomingTrippings.length > 0 ? (
                            incomingTrippings.map((trip) => (
                                <div key={trip.id} className="mb-4 border-b pb-3 last:border-0 last:pb-0">
                                    <p className="text-sm text-gray-500">{dayjs(trip.visit_date).fromNow()}</p>
                                    <p className="font-medium">{dayjs(trip.visit_date).format("MMMM D, YYYY")}</p>
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
