import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";
import {
    faLocationDot,
    faClock,
    faPaperPlane,
    faTrashAlt,
    faCalendarCheck,
    faHouseChimney,
    faPesoSign,
    faEnvelope,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import {Head, Link, router} from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

dayjs.extend(relativeTime);

const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
        case "accepted":
            return "bg-green-100 text-green-800";
        case "rejected":
            return "bg-red-100 text-red-700";
        case "cancelled":
        case "cancelled by buyer":
            return "bg-gray-100 text-gray-700";
        default:
            return "bg-yellow-100 text-yellow-800"; // pending or others
    }
};

export default function Inquiries({
                                      inquiries,
                                      status = "",
                                      allCount,
                                      pendingCount,
                                      acceptedCount,
                                      cancelledCount,
                                      rejectedCount,
                                  }) {
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelId, setCancelId] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState(
        status && status.trim() !== "" ? status : "All"
    );

    const handleCancelInquiry = () => {
        if (!cancelId) return;

        router.patch(
            `/inquiries/${cancelId}/cancel`,
            {},
            {
                onSuccess: () => {
                    console.log("Inquiry cancelled successfully.");
                    setIsCancelModalOpen(false);
                    setCancelId(null);
                },
                onError: (errors) => {
                    console.error("Failed to cancel inquiry", errors);
                },
            }
        );
    };

    return (
        <BuyerLayout>
            <Head title="Inquiries" />
            <div className="py-6 px-4">
                {isAddVisitModal && (
                    <ScheduleVisitModal
                        open={isAddVisitModal}
                        setOpen={setIsAddVisitModal}
                        visitData={selectedVisitData}
                    />
                )}

                <ConfirmDialog
                    onConfirm={handleCancelInquiry}
                    confirmText="Confirm"
                    open={isCancelModalOpen}
                    setOpen={setIsCancelModalOpen}
                    title="Cancel Inquiry"
                    description="Are you sure you want to cancel this inquiry?"
                    cancelText="Cancel"
                />

                <div className="p-6">
                    <h1 className="text-3xl font-bold text-primary mb-3">My Inquiries</h1>
                    <p className="text-gray-600 font-medium mb-6">
                        Keep track of all your property inquiries and agent communications.
                    </p>
                </div>

                <div className="flex justify-between items-center mb-5">
                    <BuyerInquiriesFilterTab
                        setSelectedStatus={setSelectedStatus}
                        count={[
                            allCount,
                            pendingCount,
                            acceptedCount,
                            cancelledCount,
                            rejectedCount,
                        ]}
                        selectedStatus={selectedStatus}
                    />
                </div>

                {inquiries.data.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No inquiries yet.</p>
                ) : (
                    inquiries.data.map((inquiry) => {
                        const property = inquiry.property ?? {};
                        const agent = inquiry.agent ?? {};
                        const message = inquiry.first_message?.message;

                        const statusLower = inquiry.status.toLowerCase();
                        const isAccepted = statusLower === "accepted";
                        const isCancelled =
                            statusLower === "cancelled" || statusLower === "cancelled by buyer";

                        // Disable scheduling if not accepted or cancelled
                        const canScheduleVisit = isAccepted && !isCancelled;



                        return (
                            <div
                                key={inquiry.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                    {/* Property Image */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                            <img
                                                src={`/storage/${property.image_url}`}
                                                onError={(e) => (e.target.src = "/placeholder.png")}
                                                alt={property.title || "Property Image"}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <FontAwesomeIcon icon={faPesoSign} />
                                                {Number(property.price).toLocaleString('en-PH', {style: 'currency', currency: 'PHP' }) ?? "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-primary leading-tight">
                                                    {property.title ?? "Unknown Property"}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                                        inquiry.status
                                                    )}`}
                                                >
                                                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                    {inquiry.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-1">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                {property.address ?? "No address provided"}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-3">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                {property.property_type ?? "Type"} – {property.sub_type ?? "Sub-type"}
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    <strong>Your message: </strong>
                                                    {message || "No message provided."}
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                Sent {dayjs(inquiry.created_at).fromNow()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Agent Info & Actions */}
                                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border">
                                                <img
                                                    src="https://placehold.co/80x80"
                                                    alt={agent.name ?? "Agent"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {agent.name ?? "Unknown Agent"}
                                                </p>
                                                <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-4 space-y-1">
                                            <p>
                                                <FontAwesomeIcon icon={faEnvelope} className="mr-1" />{" "}
                                                {agent.email ?? "N/A"}
                                            </p>
                                            <p>
                                                <FontAwesomeIcon icon={faPhone} className="mr-1" /> +63 912 345 6789
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {isAccepted ? (
                                                inquiry.trippings?.length > 0 ? (
                                                    <div
                                                        className="w-full flex-center justify-center px-4 py-2 border border-secondary bg-green-100 text-green-800 rounded-md font-medium transition"
                                                        aria-label="Visit Scheduled"
                                                    >
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                                        Scheduled!
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2 border border-secondary hover:bg-primary     text-secondary rounded-md font-medium transition"
                                                        onClick={() => {
                                                            setSelectedVisitData({
                                                                property: inquiry.property,
                                                                agentId: agent.id,
                                                                inquiryId: inquiry.id,
                                                            });
                                                            setIsAddVisitModal(true);
                                                        }}
                                                    >Schedule Visit</button>
                                                )
                                            ) : (
                                                <div
                                                    className="w-full flex-center justify-center px-4 py-2 border border-secondary bg-green-100 text-green-800 rounded-md font-medium transition"
                                                    aria-label="Visit Scheduled"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                                    {inquiry.status}
                                                </div>
                                            )}


                                            {/*/!* Schedule Visit Button or Scheduled label *!/*/}
                                            {/*{isAccepted ? (*/}
                                            {/*    !inquiry.trippings ? (*/}
                                            {/*        <button*/}
                                            {/*            type="button"*/}
                                            {/*            className="w-full px-4 py-2 border border-secondary hover:bg-primary     text-secondary rounded-md font-medium transition"*/}
                                            {/*            onClick={() => {*/}
                                            {/*                setSelectedVisitData({*/}
                                            {/*                    property: inquiry.property,*/}
                                            {/*                    agentId: agent.id,*/}
                                            {/*                    inquiryId: inquiry.id,*/}
                                            {/*                });*/}
                                            {/*                setIsAddVisitModal(true);*/}
                                            {/*            }}*/}
                                            {/*        >*/}
                                            {/*            <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />*/}
                                            {/*            Schedule Visit*/}
                                            {/*        </button>*/}
                                            {/*    ) : (*/}
                                            {/*        <div*/}
                                            {/*            className="w-full flex-center justify-center px-4 py-2 border border-secondary bg-green-100 text-green-800 rounded-md font-medium transition"*/}
                                            {/*            aria-label="Visit Scheduled"*/}
                                            {/*        >*/}
                                            {/*            <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />*/}
                                            {/*            Scheduled!*/}
                                            {/*        </div>*/}
                                            {/*    )*/}
                                            {/*) : (*/}
                                            {/*    <div*/}
                                            {/*        className="w-full flex-center justify-center px-4 py-2 border border-gray-300 text-gray-400 rounded-md font-medium transition"*/}
                                            {/*        aria-label="Cannot schedule visit"*/}
                                            {/*    >*/}
                                            {/*        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />*/}
                                            {/*        Schedule Visit*/}
                                            {/*    </div>*/}
                                            {/*)}*/}

                                            {/* Reply and Cancel Buttons */}
                                            <div className="flex gap-x-2">
                                                <Link href={`/inquiries/${property.id}`}

                                                    className={`w-full text-center px-4 py-2 text-white rounded-md text-sm font-medium transition ${
                                                        isCancelled
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-primary hover:bg-accent"
                                                    }`}

                                                    disabled={isCancelled}
                                                >
                                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                    View
                                                </Link>

                                                {isCancelled ? (
                                                    <div className="w-full py-2 border rounded-md bg-gray-100 text-center text-gray-500 font-medium">
                                                        Cancelled
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2 border bg-red-500 hover:bg-red-400 text-white rounded-md text-sm font-medium transition"
                                                        onClick={() => {
                                                            setCancelId(inquiry.id);
                                                            setIsCancelModalOpen(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}


                    <div className="flex flex-wrap gap-2 justify-end" aria-label="Pagination navigation">
                        {inquiries.links.map((link, i) => {
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
