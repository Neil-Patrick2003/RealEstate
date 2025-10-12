import TrippingStats from "@/Components/Tripping/TrippingStats.jsx";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCalendarCheck, faClock } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useState } from "react";
import {Link, router, useForm} from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import FilterTabs from "@/Components/tabs/FilterTabs.jsx";

dayjs.extend(duration);

// ✅ Function for remaining time
function getRemainingTime(date, time) {
    const formats = [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD h:mm A",
        "YYYY-MM-DD h:mm:ss A",
    ];

    let visitDateTime = null;

    for (let format of formats) {
        const parsed = dayjs(`${date} ${time}`, format);
        if (parsed.isValid()) {
            visitDateTime = parsed;
            break;
        }
    }

    if (!visitDateTime) return "Invalid date/time";

    const now = dayjs();
    if (visitDateTime.isBefore(now)) return "Started / Passed";

    const diff = visitDateTime.diff(now);
    const d = dayjs.duration(diff);

    const days = Math.floor(d.asDays());
    const hours = d.hours();
    const minutes = d.minutes();

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(" ") || "Less than 1m";
}

export default function Index({ schedules, upcomingTrips, pastTrips, cancelledTrips, pendingTrips }) {
    const { data, setData, processing, patch, reset } = useForm({
        id: null,
        status: "",
    });

    const [openAcceptModal, setOpenAcceptModal] = useState(false);
    const [openDeclineModal, setOpenDeclineModal] = useState(false);
    const [openCompleteModal, setOpenCompleteModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(10);

    // Action handlers
    const handleAccept = (trip) => { setData({ id: trip.id, status: "upcoming" }); setOpenAcceptModal(true); };
    const handleDecline = (trip) => { setData({ id: trip.id, status: "declined" }); setOpenDeclineModal(true); };
    const handleComplete = (trip) => { setData({ id: trip.id, status: "completed" }); setOpenCompleteModal(true); };
    const handleSubmit = () => {
        patch(
            route("broker.trippings.update", { id: data.id, action: data.status.toLowerCase() }),
            {
                onSuccess: () => {
                    reset();
                    setOpenAcceptModal(false);
                    setOpenDeclineModal(false);
                    setOpenCompleteModal(false);
                },
            }
        );
    };

    // Helpers
    const hasStarted = (date, time) => dayjs(`${date} ${time}`).isBefore(dayjs());
    const isMissed = (date, time, status) => dayjs(`${date} ${time}`).isBefore(dayjs()) && status.toLowerCase() !== "completed";

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case "accepted": return "bg-green-100 text-green-800";
            case "rejected": return "bg-red-100 text-red-700";
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "cancelled": return "bg-gray-100 text-gray-700";
            default: return "bg-orange-100 text-orange-700";
        }
    };

    const inquiryTabs = ["All", "Pending", "Upcoming", "Declined", "Cancelled"];

    const getBadgeClass = (name, isActive) => {
        const normalized = name.toLowerCase();
        const map = {
            all: isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700",
            pending: isActive ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-800",
            upcoming: isActive ? "bg-green-600 text-white" : "bg-green-100 text-green-800",
            declined: isActive ? "bg-red-600 text-white" : "bg-red-100 text-red-700",
            cancelled: isActive ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700",
        };
        return map[normalized] || "bg-gray-100 text-gray-800";
    };

    return (
        <BrokerLayout>
            {/* Confirm Dialogs */}
            {[openAcceptModal, openDeclineModal, openCompleteModal].map((open, idx) => (
                <ConfirmDialog
                    key={idx}
                    onConfirm={handleSubmit}
                    title={
                        idx === 0
                            ? "Are you sure you want to accept this trip?"
                            : idx === 1
                                ? "Are you sure you want to decline this trip?"
                                : "Tripping Completed?"
                    }
                    description={
                        idx < 2
                            ? "This action cannot be undone."
                            : "Are you sure you want to mark this trip as completed? This action cannot be undone."
                    }
                    confirmText="Confirm"
                    cancelText="Cancel"
                    open={open}
                    setOpen={
                        idx === 0 ? setOpenAcceptModal :
                            idx === 1 ? setOpenDeclineModal :
                                setOpenCompleteModal
                    }
                    loading={processing}
                />
            ))}

            <div className='flex-center-between'>
                <h1 className="flex flex-col text-2xl font-bold mb-6">
                    Tripping Management
                    <span className="text-gray-600 text-sm font-normal">
                        Manage property viewing schedules and client appointments
                    </span>
                </h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                <TrippingStats title="Upcoming Trips" count={upcomingTrips} icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />} bgColor="bg-green-100" />
                <TrippingStats title="Pending Trips" count={pendingTrips} icon={<FontAwesomeIcon icon={faClock} className="text-yellow-600" />} bgColor="bg-yellow-100" />
                <TrippingStats title="Completed Trips" count={pastTrips} icon={<FontAwesomeIcon icon={faCalendarCheck} className="text-red-600" />} bgColor="bg-red-100" />
            </div>

            {/* Filter Tabs */}
            <div className="mb-8">
                <FilterTabs
                    tabs={inquiryTabs.map(name => ({ name }))}
                    counts={[schedules.length, pendingTrips, upcomingTrips, cancelledTrips, cancelledTrips]}
                    selectedTab={selectedStatus}
                    setSelectedTab={setSelectedStatus}
                    onTabChange={(name) => {
                        setSelectedStatus(name);
                        router.get("/broker/trippings", { items_per_page: selectedItemsPerPage, page: 1, status: name }, { preserveState: true, replace: true });
                    }}
                    getBadgeClass={getBadgeClass}
                />
            </div>

            {/* Trip Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {schedules.data.map((trip) => (
                    <div key={trip.id} className="bg-white rounded-lg shadow hover:shadow-lg border border-gray-200 overflow-hidden transition">
                        {/* Property Image */}
                        {trip.property?.image_url && (
                            <div className="relative">
                                <img src={`/storage/${trip.property.image_url}`} alt={`Property at ${trip.property?.address}`} className="w-full h-48 object-cover" />
                                {isMissed(trip.visit_date, trip.visit_time, trip.status) && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Missed</div>
                                )}
                            </div>
                        )}

                        <div className="p-5 flex flex-col justify-between">
                            {/* Status + Date */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(trip.status)}`}>{trip.status}</span>
                                <span className="text-gray-500 text-sm">{dayjs(trip.created_at).format("MMMM D, YYYY")}</span>
                            </div>

                            {/* Property Info */}
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{trip.property?.title ?? "Untitled Property"}</h3>
                            <p className="text-sm text-gray-600 mb-3">{trip.property?.address ?? "No Address Available"}</p>

                            {/* Client Info */}
                            <div className="flex items-center mb-3">
                                {trip.clientImage ? (
                                    <img src={trip.clientImage} alt={trip.clientName} className="w-10 h-10 rounded-full mr-3" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                        <span className="text-sm font-bold text-white">{trip.clientName?.charAt(0) ?? "C"}</span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{trip?.buyer?.name}</p>
                                    <p className="text-sm text-gray-500">Buyer</p>
                                </div>
                            </div>

                            {/* Time + Remaining */}
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                <span>⏰ {trip?.visit_time}</span>
                                <span>📍 {getRemainingTime(trip.visit_date, trip.visit_time)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col space-y-2">
                                {trip.status.toLowerCase() === "pending" && (
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleAccept(trip)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition">Accept</button>
                                        <button onClick={() => handleDecline(trip)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg text-sm font-medium transition">Decline</button>
                                    </div>
                                )}
                                {trip.status.toLowerCase() === "upcoming" && hasStarted(trip.visit_date, trip.visit_time) && (
                                    <button onClick={() => handleComplete(trip)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition">Mark as Completed</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t border-gray-100 rounded-b-xl">
                {schedules?.links.map((link, idx) =>
                    link.url ? (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`px-3 py-2 rounded-md text-sm border transition ${
                                link.active
                                    ? "bg-primary text-white font-semibold"
                                    : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ) : (
                        <span
                            key={idx}
                            className="px-3 py-2 text-sm text-gray-400 bg-white border rounded-md cursor-not-allowed"
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    )
                )}
            </div>
        </BrokerLayout>
    );
}
