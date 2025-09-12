import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faClock,
    faComment,
    faHouseChimney,
    faLocationDot,
    faXmark,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { Link, router } from "@inertiajs/react";
import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import FilterTabs from "@/Components/tabs/FilterTabs.jsx";

// Extend dayjs with relative time
dayjs.extend(relativeTime);

export default function Index({
                                  inquiries,
                                  inquiriesCount,
                                  rejectedCount,
                                  acceptedCount,
                                  pendingCount,
                                  cancelledCount,
                                  page = 1,
                                  itemsPerPage = 10,
                                  status = "",
                              }) {
    const [loadingId, setLoadingId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        inquiryId: null,
        action: null,
    });
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);

    // Badge colors
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case "accepted":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-orange-100 text-orange-700";
        }
    };

    // Confirm dialog handlers
    const handleOpenConfirmDialog = (inquiryId, action) => {
        setConfirmDialog({ open: true, inquiryId, action });
    };
    const handleCloseConfirmDialog = () => {
        setConfirmDialog({ open: false, inquiryId: null, action: null });
    };
    const handleConfirmAction = () => {
        const { inquiryId, action } = confirmDialog;
        if (!inquiryId || !action) return;

        setLoadingId(inquiryId);

        router.patch(
            `/broker/inquiries/${inquiryId}/${action}`,
            {},
            {
                onSuccess: () => {
                    handleCloseConfirmDialog();
                },
                onFinish: () => {
                    setLoadingId(null);
                },
            }
        );
    };

    const getContactPerson = (inquiry) => {
        if (inquiry.buyer) return inquiry.buyer;
        return {};
    };

    const inquiryTabs = [
        { name: "All" },
        { name: "Pending" },
        { name: "Accepted" },
        { name: "Rejected" },
        { name: "Cancelled" },
    ];

    const getBadgeClass = (name, isActive) => {
        const normalized = name.toLowerCase();
        const map = {
            all: isActive
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700",
            pending: isActive
                ? "bg-primary text-white"
                : "bg-lightaccent text-green-800",
            accepted: isActive
                ? "bg-secondary text-white"
                : "bg-orange-100 text-secondary",
            rejected: isActive
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700",
            cancelled: isActive
                ? "bg-gray-600 text-white"
                : "bg-gray-100 text-gray-700",
        };
        return map[normalized] || "bg-gray-100 text-gray-800";
    };

    return (
        <BrokerLayout>
            <div>
                <h1 className="text-3xl font-bold mb-6">Inquiries</h1>

                <FilterTabs
                    tabs={inquiryTabs}
                    counts={[
                        inquiriesCount,
                        pendingCount,
                        acceptedCount,
                        rejectedCount,
                        cancelledCount,
                    ]}
                    selectedTab={selectedStatus}
                    setSelectedTab={setSelectedStatus}
                    onTabChange={(name) => {
                        router.get(
                            "/broker/inquiries",
                            {
                                items_per_page: selectedItemsPerPage,
                                page: 1,
                                status: name,
                            },
                            {
                                preserveState: true,
                                replace: true,
                            }
                        );
                    }}
                    getBadgeClass={getBadgeClass}
                />

                <div className="mb-6"></div>

                {inquiries.data.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">
                        No inquiries yet.
                    </p>
                ) : (
                    inquiries.data.map((inquiry) => {
                        const property = inquiry.property ?? {};
                        const buyer = inquiry.buyer ?? {};
                        const contactPerson = getContactPerson(inquiry);
                        const message = inquiry.notes;

                        return (
                            <div
                                key={inquiry.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                    {/* Property Image */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                            <img
                                                src={`/storage/${property.image_url}`}
                                                onError={(e) =>
                                                    (e.target.src =
                                                        "/placeholder.png")
                                                }
                                                alt={
                                                    property.title ??
                                                    "Property Image"
                                                }
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                {property.price
                                                    ? new Intl.NumberFormat(
                                                        "en-PH",
                                                        {
                                                            style: "currency",
                                                            currency: "PHP",
                                                            minimumFractionDigits: 0,
                                                        }
                                                    ).format(property.price)
                                                    : "Not available"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-primary leading-tight">
                                                    {property.title ??
                                                        "Unknown Property"}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                                        inquiry.status
                                                    )}`}
                                                    aria-label={`Inquiry status: ${inquiry.status}`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faClock}
                                                        className="mr-1"
                                                    />
                                                    {inquiry.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-1 flex items-center">
                                                <FontAwesomeIcon
                                                    icon={faLocationDot}
                                                    className="mr-1"
                                                />
                                                {property.address ??
                                                    "No address provided"}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                                                <FontAwesomeIcon
                                                    icon={faHouseChimney}
                                                    className="mr-1"
                                                />
                                                {property.property_type ??
                                                    "Type"}{" "}
                                                –{" "}
                                                {property.sub_type ??
                                                    "Sub-type"}
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    <strong>
                                                        Client message:{" "}
                                                    </strong>
                                                    {message ||
                                                        "No message provided."}
                                                </p>
                                            </div>

                                            {/* Timestamp */}
                                            <p className="text-xs text-gray-400 flex items-center">
                                                <FontAwesomeIcon
                                                    icon={faClock}
                                                    className="mr-1"
                                                />
                                                {dayjs(
                                                    inquiry.created_at
                                                ).format("MMMM D, YYYY, h:mm A")}
                                                <span className="ml-2 text-gray-500">
                                                    (
                                                    {dayjs(
                                                        inquiry.created_at
                                                    ).fromNow()}
                                                    )
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact + Actions */}
                                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                        <div className="flex-center-between">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border flex items-center justify-center bg-gray-200 text-gray-700 font-bold">
                                                    {contactPerson.avatar_url ? (
                                                        <img
                                                            src={
                                                                contactPerson.avatar_url
                                                            }
                                                            alt={
                                                                contactPerson.name ??
                                                                "Agent"
                                                            }
                                                            onError={(e) => {
                                                                e.currentTarget.style.display =
                                                                    "none";
                                                                e.currentTarget.parentNode.textContent =
                                                                    contactPerson.name
                                                                        ? contactPerson.name
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()
                                                                        : "A";
                                                            }}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm">
                                                            {contactPerson.name
                                                                ? contactPerson.name
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                                : "A"}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {contactPerson.name ??
                                                            "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {contactPerson.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => alert('Not Implemented yet')}
                                                className="flex  items-center mb-4 p-2 rounded cursor-pointer hover:bg-gray-100">
                                                <FontAwesomeIcon
                                                    icon={faComment}
                                                    className={`text-gray-500 w-5 h-5`}
                                                />
                                            </button>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-4 space-y-1">
                                            <p className="flex items-center">
                                                <FontAwesomeIcon
                                                    icon={faLocationDot}
                                                    className="mr-1"
                                                />{" "}
                                                {buyer.address ??
                                                    "Not available"}
                                            </p>
                                            <p className="flex items-center">
                                                <FontAwesomeIcon
                                                    icon={faPhone}
                                                    className="mr-1"
                                                />{" "}
                                                {buyer.contact_number ??
                                                    "Not available"}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {inquiry.status.toLowerCase() ===
                                                "pending" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="w-full px-4 py-2 bg-primary hover:bg-accent text-white rounded-md text-sm font-medium transition"
                                                            onClick={() =>
                                                                handleOpenConfirmDialog(
                                                                    inquiry.id,
                                                                    "accept"
                                                                )
                                                            }
                                                            disabled={
                                                                loadingId ===
                                                                inquiry.id
                                                            }
                                                        >
                                                            {loadingId ===
                                                            inquiry.id ? (
                                                                "Processing..."
                                                            ) : (
                                                                <>
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faCheck
                                                                        }
                                                                        className="mr-2"
                                                                    />
                                                                    Accept
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="w-full px-4 py-2 border border-secondary hover:bg-secondary text-secondary hover:text-white rounded-md text-sm font-medium transition"
                                                            onClick={() =>
                                                                handleOpenConfirmDialog(
                                                                    inquiry.id,
                                                                    "reject"
                                                                )
                                                            }
                                                            disabled={
                                                                loadingId ===
                                                                inquiry.id
                                                            }
                                                        >
                                                            {loadingId ===
                                                            inquiry.id ? (
                                                                "Processing..."
                                                            ) : (
                                                                <>
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faXmark
                                                                        }
                                                                        className="mr-2"
                                                                    />
                                                                    Reject
                                                                </>
                                                            )}
                                                        </button>
                                                    </>
                                                )}

                                            {inquiry.status.toLowerCase() ===
                                                "accepted" && (
                                                    <Link
                                                        href={`/broker/inquiries/${inquiry.id}`}
                                                        className="w-full px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md font-medium transition text-center"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                            className="mr-2"
                                                        />
                                                        View
                                                    </Link>
                                                )}

                                            {/rejected|cancelled/i.test(
                                                inquiry.status
                                            ) && (
                                                <button
                                                    className="w-full bg-gray-200 py-2 rounded-md flex justify-center items-center cursor-not-allowed text-gray-400"
                                                    disabled
                                                >
                                                    {inquiry.status}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Confirm Dialog */}
                {confirmDialog.open && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">
                                Confirm{" "}
                                {confirmDialog.action === "accept"
                                    ? "Acceptance"
                                    : "Rejection"}
                            </h2>
                            <p className="mb-6">
                                Are you sure you want to {confirmDialog.action}{" "}
                                this inquiry?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleCloseConfirmDialog}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t border-gray-100 rounded-b-xl">
                    {inquiries?.links.map((link, idx) =>
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
            </div>
        </BrokerLayout>
    );
}
