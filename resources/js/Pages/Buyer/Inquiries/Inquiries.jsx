import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";
import {
    faLocationDot,
    faClock,
    faPaperPlane,
    faTrashAlt,
    faCalendarCheck,
    faHouseChimney,
    faEnvelope,
    faPhone,
    faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import { Head, Link, router } from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

dayjs.extend(relativeTime);

/* ---------- helpers ---------- */
const arr = (v) => (Array.isArray(v) ? v : []);
const peso = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
};
const cn = (...c) => c.filter(Boolean).join(" ");
const getStatusBadge = (status) => {
    const s = (status ?? "").toLowerCase();
    switch (s) {
        case "accepted":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "rejected":
            return "bg-rose-50 text-rose-700 border border-rose-200";
        case "cancelled":
        case "cancelled by buyer":
            return "bg-gray-50 text-gray-700 border border-gray-200";
        default:
            return "bg-amber-50 text-amber-700 border border-amber-200"; // pending/others
    }
};

export default function Inquiries({
                                      inquiries = { data: [], links: [] },
                                      status = "",
                                      allCount = 0,
                                      pendingCount = 0,
                                      acceptedCount = 0,
                                      cancelledCount = 0,
                                      rejectedCount = 0,
                                  }) {
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelId, setCancelId] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState(status?.trim() ? status : "All");

    const handleCancelInquiry = () => {
        if (!cancelId) return;
        router.patch(`/inquiries/${cancelId}/cancel`, {}, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
                setCancelId(null);
            },
            onError: (errors) => console.error("Failed to cancel inquiry", errors),
        });
    };

    const list = arr(inquiries?.data);

    return (
        <BuyerLayout>
            <Head title="Inquiries" />
            <div className="py-6">
                {/* Modals */}
                {isAddVisitModal && (
                    <ScheduleVisitModal open={isAddVisitModal} setOpen={setIsAddVisitModal} visitData={selectedVisitData} />
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

                {/* Header */}
                <div className="pt-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-800" />
                        My Inquiries
                    </h1>
                    <p className="text-gray-600">Keep track of all your property inquiries and agent communications.</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-between items-center mt-6 mb-5">
                    <BuyerInquiriesFilterTab
                        setSelectedStatus={setSelectedStatus}
                        count={[allCount, pendingCount, acceptedCount, cancelledCount, rejectedCount]}
                        selectedStatus={selectedStatus}
                    />
                </div>

                {/* Empty state */}
                {list.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <FontAwesomeIcon icon={faFolderOpen} className="text-gray-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">No inquiries yet</h2>
                        <p className="mt-2 text-gray-600">When you inquire about a property, it will appear here.</p>
                    </div>
                ) : (
                    list.map((inquiry) => {
                        const property = inquiry?.property ?? {};
                        const agent = inquiry?.agent ?? null;
                        const broker = inquiry?.broker ?? null;
                        const contact = agent || broker || {};

                        const message = inquiry?.notes || "";
                        const statusLower = (inquiry?.status || "").toLowerCase();
                        const isAccepted = statusLower === "accepted";
                        const isCancelled = statusLower === "cancelled" || statusLower === "cancelled by buyer";
                        const canScheduleVisit = isAccepted && !isCancelled;
                        const hasTrippings = arr(inquiry?.trippings).length > 0;

                        const imageSrc = property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png";
                        const createdAgo = inquiry?.created_at ? dayjs(inquiry.created_at).fromNow() : "—";

                        return (
                            <div
                                key={inquiry?.id ?? Math.random()}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                    {/* Property Image */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="relative rounded-xl overflow-hidden h-48 shadow-sm">
                                            <img
                                                src={imageSrc}
                                                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                alt={property?.title || "Property Image"}
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                                                {peso(property?.price)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2 gap-3">
                                                <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                                                    {property?.title ?? "Unknown Property"}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                                                        getStatusBadge(inquiry?.status)
                                                    )}
                                                >
                          <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                    {inquiry?.status ?? "Pending"}
                        </span>
                                            </div>

                                            <p className="text-gray-700 text-sm mb-1">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-gray-500" />
                                                {property?.address ?? "No address provided"}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-3">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                {property?.property_type ?? "Type"} <span className="text-gray-400">•</span>{" "}
                                                {property?.sub_type ?? "Sub-type"}
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                                <p className="text-sm text-gray-800 line-clamp-2">
                                                    <strong>Your message: </strong>
                                                    {message || "No message provided."}
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                Sent {createdAgo}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Agent Info & Actions */}
                                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                        <div className="flex items-center mb-4">
                                            <div className="w-11 h-11 rounded-full overflow-hidden mr-3 border border-gray-200 bg-white">
                                                {contact?.photo_url ? (
                                                    <img
                                                        src={`/storage/${contact.photo_url}`}
                                                        alt={contact?.name ?? "Contact"}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white font-semibold text-base">
                                                        {(contact?.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{contact?.name ?? "Contact"}</p>
                                                <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-600 mb-4 space-y-1">
                                            <p>
                                                <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-gray-500" />
                                                {contact?.email ?? "N/A"}
                                            </p>
                                            <p>
                                                <FontAwesomeIcon icon={faPhone} className="mr-1 text-gray-500" />
                                                {contact?.phone ?? "+63 912 345 6789"}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            {/* Schedule Visit / Scheduled / Status */}
                                            {canScheduleVisit ? (
                                                hasTrippings ? (
                                                    <div
                                                        className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                                                        aria-label="Visit Scheduled"
                                                    >
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                                        Scheduled!
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50 font-medium transition"
                                                        onClick={() => {
                                                            setSelectedVisitData({
                                                                property,
                                                                agentId: agent?.id ?? null,
                                                                brokerId: broker?.id ?? null,
                                                                inquiryId: inquiry?.id ?? null,
                                                            });
                                                            setIsAddVisitModal(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                                        Schedule Visit
                                                    </button>
                                                )
                                            ) : (
                                                <div
                                                    className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-gray-50 text-gray-700 border border-gray-200 font-medium"
                                                    aria-label="Visit Status"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                                    {inquiry?.status ?? "Pending"}
                                                </div>
                                            )}

                                            {/* View / Cancel */}
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/inquiries/${property?.id ?? inquiry?.id}`}
                                                    className={cn(
                                                        "w-full text-center px-4 py-2 rounded-md text-sm font-medium transition",
                                                        isCancelled ? "bg-gray-300 text-white cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"
                                                    )}
                                                    aria-disabled={isCancelled}
                                                >
                                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                    View
                                                </Link>

                                                {isCancelled ? (
                                                    <div className="w-full py-2 rounded-md bg-gray-100 text-center text-gray-500 font-medium border border-gray-200">
                                                        Cancelled
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2 rounded-md text-sm font-medium transition bg-rose-600 hover:bg-rose-500 text-white"
                                                        onClick={() => {
                                                            setCancelId(inquiry?.id ?? null);
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

                {/* Pagination */}
                <div className="flex flex-wrap gap-2 justify-end mt-6" aria-label="Pagination navigation">
                    {arr(inquiries?.links).map((link, i) =>
                        link?.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={cn(
                                    "px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition",
                                    link.active ? "bg-gray-900 text-white font-semibold border-gray-900" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                aria-current={link.active ? "page" : undefined}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link?.label ?? "" }}
                                aria-disabled="true"
                            />
                        )
                    )}
                </div>
            </div>
        </BuyerLayout>
    );
}
