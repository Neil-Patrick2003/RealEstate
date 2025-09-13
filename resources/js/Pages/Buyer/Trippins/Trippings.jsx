import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faClock,
    faLocationDot,
    faHouseChimney,
    faEnvelope,
    faPhone,
    faTrashAlt,
    faPaperPlane,
    faPesoSign,
    faCommentDots,
    faCalendarPlus,
    faRedo,
    faExpand,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import {Head, Link} from "@inertiajs/react";

dayjs.extend(relativeTime);

export default function Trippings({ trippings }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [openCancelModal, setOpenCancelModal] = useState(false);

    const openScheduleModal = (trip) => {
        setSelectedVisit(trip);
        setModalOpen(true);
    };

    const handleCancelVisit = () => {
        console.log("Cancelling visit:", selectedVisit);
        // TODO: Add API call here to cancel the visit
        setOpenCancelModal(false);
        setSelectedVisit(null);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "accepted":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "cancelled":
                return "bg-gray-200 text-gray-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <BuyerLayout>
            <Head title="Tripping" />

            {/* Modals */}
            <ScheduleVisitModal
                open={modalOpen}
                setOpen={setModalOpen}
                visitData={selectedVisit}
            />
            <ConfirmDialog
                onConfirm={handleCancelVisit}
                setOpen={setOpenCancelModal}
                open={openCancelModal}
                title="Cancel Visit Schedule"
                description="Do you want to cancel this visit? This action cannot be undone."
                confirmText="Yes, Confirm"
            />

            <div className="mt-10 px-6 py-4 mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-6 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    Scheduled Trippings
                </h1>

                {trippings.length === 0 ? (
                    <p className="text-gray-500 text-center py-16 text-lg">
                        You don’t have any scheduled visits yet.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {trippings.data.map((trip) => {
                            const now = dayjs();
                            const tripDate = dayjs(trip.visit_date);
                            const isFuture = tripDate.isAfter(now, "day");
                            const isToday = tripDate.isSame(now, "day");
                            const isPast = tripDate.isBefore(now, "day");
                            const statusColor = getStatusColor(trip.status);

                            return (
                                <div
                                    key={trip.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-200"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 p-6">
                                        {/* Property Image */}
                                        <div className="col-span-12 lg:col-span-3">
                                            <div className="relative rounded-md overflow-hidden h-48 shadow-sm">
                                                <img
                                                    src={`/storage/${trip.property.image_url}`}
                                                    alt={trip.property.title}
                                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                />
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                    <FontAwesomeIcon icon={faPesoSign} className="mr-1" />
                                                    {parseFloat(trip.property.price).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property Details */}
                                        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-semibold text-primary">
                                                        {trip.property.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}>
                                                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                        {trip.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm">
                                                    <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                    {trip.property.address}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                    {trip.property.property_type} – {trip.property.sub_type}
                                                </p>

                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm text-gray-700">
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2 text-primary" />
                                                        Visit Date: <strong>{tripDate.format("MMMM D, YYYY")}</strong>
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <FontAwesomeIcon icon={faClock} className="mr-2 text-primary" />
                                                        Time: <strong>{dayjs(`1970-01-01T${trip.visit_time}`).format("hh:mm A")}</strong>
                                                    </p>

                                                    {trip.notes && (
                                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
                                                            <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-primary" />
                                                            <strong>Notes:</strong> {trip.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-400 mt-3">
                                                    Scheduled {dayjs(trip.created_at).fromNow()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Agent Info + Actions */}
                                        <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border mr-3">
                                                    <img
                                                        src={`/storage/${trip?.agent?.photo_url}`}
                                                        alt={trip.agent?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{trip?.agent?.name}</p>
                                                    <p className="text-xs text-gray-500">{trip?.agent?.email}</p>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 space-y-1 mb-4">
                                                {trip.agent?.contact_number && (
                                                    <p>
                                                        <FontAwesomeIcon icon={faPhone} className="mr-1" />
                                                        {trip?.agent?.contact_number}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* Button 1: View OR Reschedule OR Missed? Reschedule */}
                                                {trip.status === "accepted" && isFuture ? (
                                                    <Link
                                                        href={`/properties/${trip.property.id}`}
                                                        className="w-full px-4 py-2 border bg-secondary hover:bg-primary-dark text-white rounded-md text-sm font-medium text-center transition"
                                                    >
                                                        <FontAwesomeIcon icon={faExpand} className="mr-2" />
                                                        View
                                                    </Link>
                                                ) : trip.status === "accepted" && isPast ? (
                                                    <button
                                                        onClick={() => openScheduleModal(trip)}
                                                        className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md text-sm font-medium transition"
                                                    >
                                                        <FontAwesomeIcon icon={faRedo} className="mr-2" />
                                                        Missed? Reschedule
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openScheduleModal(trip)}
                                                        className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium transition"
                                                    >
                                                        <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                                                        Reschedule
                                                    </button>
                                                )}

                                                {/* Button 2: Message */}
                                                <button
                                                    className="w-full px-4 py-2 bg-primary hover:bg-accent text-white rounded-md text-sm font-medium transition"
                                                >
                                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                    Message
                                                </button>

                                                {/* Button 3: Cancel */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedVisit(trip);
                                                        setOpenCancelModal(true);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md text-sm font-medium transition"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                                    Cancel
                                                </button>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 justify-end" aria-label="Pagination navigation">
                    {trippings.links.map((link, i) => {
                        return link.url ? (
                            <Link
                                key={i}
                                className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition ${
                                    link.active ? 'bg-primary text-white font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                aria-current={link.active ? 'page' : undefined}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                aria-disabled="true"
                            />
                        );
                    })}
                </div>
            </div>
        </BuyerLayout>
    );
}
