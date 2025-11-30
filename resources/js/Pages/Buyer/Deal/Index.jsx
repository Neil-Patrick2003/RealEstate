import React, { useState } from "react";
import { router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import Modal from "@/Components/Modal.jsx";
import {
    CheckCircle,
    XCircle,
    Clock,
    Edit3,
    ArrowLeftRight,
    Eye,
    Trash2,
    MessageCircle,
} from "lucide-react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import FeedbackForm from "@/Components/modal/Buyer/FeedbackForm.jsx";

const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: {
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: Clock,
            label: "Pending",
        },
        accepted: {
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle,
            label: "Accepted",
        },
        accept: {
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle,
            label: "Accepted",
        },
        rejected: {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
            label: "Rejected",
        },
        decline: {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
            label: "Declined",
        },
        declined: {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
            label: "Declined",
        },
        negotiating: {
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: ArrowLeftRight,
            label: "Negotiating",
        },
        counter_offer: {
            color: "bg-purple-100 text-purple-800 border-purple-200",
            icon: Edit3,
            label: "Counter Offer",
        },
        completed: {
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: CheckCircle,
            label: "Completed",
        },
        cancelled: {
            color: "bg-gray-100 text-gray-700 border-gray-200",
            icon: XCircle,
            label: "Cancelled",
        },
        cancel: {
            color: "bg-gray-100 text-gray-700 border-gray-200",
            icon: XCircle,
            label: "Cancelled",
        },
        sold: {
            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
            icon: CheckCircle,
            label: "Sold",
        },
    };

    const config =
        statusConfig[(status || "").toLowerCase()] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
        <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
        >
            <IconComponent className="h-3 w-3 mr-1.5" />
            {config.label}
        </div>
    );
};

export default function BuyerDealsPage({ deals, auth }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingDeal, setRejectingDeal] = useState(null);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelingDeal, setCancelingDeal] = useState(null);

    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [acceptingDeal, setAcceptingDeal] = useState(null);

    // 🔹 Feedback modal state (for FeedbackForm)
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackDeal, setFeedbackDeal] = useState(null);
    const [feedbackAgentId, setFeedbackAgentId] = useState(null);

    const authUserId = auth?.user?.id;

    const dealsData = Array.isArray(deals) ? deals : [];

    const columns = [
        {
            key: "property",
            header: "Property",
            render: (deal) => (
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {deal.property_listing?.property?.title ||
                            "Untitled Property"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            ID: {deal.property_listing?.id || "N/A"}
                        </span>
                        {deal.property_listing?.status && (
                            <span
                                className={`text-xs px-2 py-1 rounded ${
                                    deal.property_listing.status === "active"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-gray-50 text-gray-700 border border-gray-200"
                                }`}
                            >
                                {deal.property_listing.status}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "price",
            header: "List Price",
            render: (deal) => (
                <div className="text-sm text-gray-600 font-medium">
                    ₱
                    {Number(
                        deal.property_listing?.property?.price || 0
                    ).toLocaleString("en-PH")}
                </div>
            ),
        },
        {
            key: "amount",
            header: "Offer Amount",
            render: (deal) => (
                <div className="font-semibold text-gray-900 text-sm">
                    ₱{Number(deal.amount).toLocaleString("en-PH")}
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (deal) => <StatusBadge status={deal.status} />,
        },
        {
            key: "note",
            header: "Notes",
            render: (deal) => <div>{deal.notes ?? <i>no notes</i>}</div>,
        },
        {
            key: "updated",
            header: "Last Updated",
            render: (deal) => {
                const updatedAt = deal.amount_last_updated_at
                    ? new Date(deal.amount_last_updated_at)
                    : null;

                return (
                    <div className="text-sm text-gray-600">
                        {updatedAt ? (
                            <>
                                <div>
                                    {updatedAt.toLocaleDateString("en-PH")}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {updatedAt.toLocaleTimeString("en-PH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="text-xs text-gray-400">N/A</div>
                        )}
                    </div>
                );
            },
        },
    ];

    const openAcceptModal = (deal) => {
        setAcceptingDeal(deal);
        setAcceptModalOpen(true);
    };

    const handleAccept = () => {
        if (!acceptingDeal) return;

        router.put(
            route("deal.deals.update_status", {
                id: acceptingDeal.id,
                status: "accept",
            }),
            {
                status: "accept",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAcceptModalOpen(false);
                    setAcceptingDeal(null);
                },
            }
        );
    };

    const openRejectModal = (deal) => {
        setRejectingDeal(deal);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const submitReject = () => {
        if (!rejectingDeal || !rejectReason.trim()) return;

        router.put(
            route("deal.deals.update_status", {
                id: rejectingDeal.id,
                status: "decline",
            }),
            {
                status: "decline",
                rejection_reason: rejectReason.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectModalOpen(false);
                    setRejectingDeal(null);
                    setRejectReason("");
                },
            }
        );
    };

    const openCancelModal = (deal) => {
        setCancelingDeal(deal);
        setCancelModalOpen(true);
    };

    const submitCancel = () => {
        if (!cancelingDeal) return;

        router.put(
            route("deal.deals.update_status", {
                id: cancelingDeal.id,
                status: "cancel",
            }),
            {
                status: "cancel",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCancelModalOpen(false);
                    setCancelingDeal(null);
                },
            }
        );
    };

    const actions = (deal) => {
        const isUserRequester =
            authUserId &&
            Number(authUserId) === Number(deal.amount_last_updated_by);

        const status = (deal.status || "").toLowerCase();
        const isActionable = ["pending", "negotiating", "counter_offer"].includes(
            status
        );

        const isClosedForFeedback = [
            "sold",
            "cancelled",
            "cancel",
            "declined",
            "decline",
        ].includes(status);

        const hasFeedback =
            Array.isArray(deal.feedback) && deal.feedback.length > 0;

        const items = [];

        // always view property
        items.push({
            label: "View Property",
            variant: "ghost",
            icon: Eye,
            onClick: () => {
                window.open(
                    `/property-listings/${deal.property_listing_id}`,
                    "_blank"
                );
            },
        });

        // closed deals → feedback button
        if (!isActionable && isClosedForFeedback) {
            if (!hasFeedback) {
                items.push({
                    label: "Rate Agent / Send Feedback",
                    variant: "primary",
                    icon: MessageCircle,
                    onClick: () => {
                        // 🔹 NEW LOGIC: decide who receives feedback
                        const rawAgents =
                            deal.property_listing?.agents || [];
                        const broker =
                            deal.property_listing?.broker || null;

                        let recipients = rawAgents;

                        // If no agents but there is a broker → treat broker as the only "agent" for feedback
                        if (
                            (!Array.isArray(rawAgents) ||
                                rawAgents.length === 0) &&
                            broker
                        ) {
                            recipients = [
                                {
                                    id: broker.id,
                                    name: broker.name,
                                    role: "Broker",
                                },
                            ];
                        }

                        const autoAgentId =
                            Array.isArray(recipients) &&
                            recipients.length === 1
                                ? recipients[0].id
                                : null;

                        // clone deal with overridden agents so FeedbackForm sees the right recipients
                        const dealWithRecipients = {
                            ...deal,
                            property_listing: {
                                ...deal.property_listing,
                                agents: recipients,
                            },
                        };

                        setFeedbackDeal(dealWithRecipients);
                        setFeedbackAgentId(autoAgentId);
                        setFeedbackOpen(true);
                    },
                    className:
                        "!bg-indigo-600 !text-white !border !border-indigo-600 hover:!bg-indigo-700",
                });
            }

            return items;
        }

        if (!isActionable) {
            return items;
        }

        if (isUserRequester) {
            items.push(
                {
                    label: "Edit Offer",
                    variant: "primary",
                    icon: Edit3,
                    onClick: () => {
                        setSelectedDeal(deal);
                        setIsModalOpen(true);
                    },
                    className:
                        "!bg-indigo-600 !text-white !border !border-indigo-600 hover:!bg-indigo-700",
                },
                {
                    label: "Cancel Offer",
                    variant: "secondary",
                    icon: Trash2,
                    onClick: () => openCancelModal(deal),
                    className:
                        "!bg-white !text-red-600 !border !border-red-500 hover:!bg-red-50",
                }
            );
        } else {
            items.push(
                {
                    label: "Counter Offer",
                    variant: "primary",
                    icon: ArrowLeftRight,
                    onClick: () => {
                        setSelectedDeal(deal);
                        setIsModalOpen(true);
                    },
                    className:
                        "!bg-blue-600 !text-white !border !border-blue-600 hover:!bg-blue-700",
                },
                {
                    label: "Accept",
                    variant: "primary",
                    icon: CheckCircle,
                    onClick: () => openAcceptModal(deal),
                    className:
                        "!bg-emerald-600 !text-white !border !border-emerald-600 hover:!bg-emerald-700",
                },
                {
                    label: "Reject",
                    variant: "danger",
                    icon: XCircle,
                    onClick: () => openRejectModal(deal),
                    className:
                        "!bg-red-600 !text-white !border !border-red-600 hover:!bg-red-700",
                },
                {
                    label: "Cancel Offer",
                    variant: "secondary",
                    icon: Trash2,
                    onClick: () => openCancelModal(deal),
                    className:
                        "!bg-white !text-red-600 !border !border-red-500 hover:!bg-red-50",
                }
            );
        }

        return items;
    };

    return (
        <AuthenticatedLayout>
            <div className="py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        My Deals & Offers
                    </h1>
                    <p className="text-gray-600">
                        Manage your property offers and negotiations
                    </p>
                </div>

                <DataTable
                    columns={columns}
                    data={dealsData}
                    actions={actions}
                    getRowId={(deal) => deal.id}
                    emptyMessage={
                        <div className="text-center py-12">
                            <div className="text-gray-300 text-4xl mb-4">
                                🏠
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No deals yet
                            </h3>
                            <p className="text-gray-500">
                                Start by making an offer on a property you're
                                interested in.
                            </p>
                        </div>
                    }
                />
            </div>

            {/* Deal form modal */}
            {selectedDeal && (
                <DealFormModal
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    property={selectedDeal.property_listing?.property}
                    propertyListingId={selectedDeal.property_listing_id}
                    initialValue={selectedDeal}
                />
            )}

            {/* Reject modal */}
            <Modal
                show={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                maxWidth="xl"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Reject Offer
                            </h2>
                            <p className="text-sm text-gray-600">
                                Offer #{rejectingDeal?.id}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for rejection{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                            rows={4}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please provide a brief explanation for rejecting this offer..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This will be shared with the other party.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => setRejectModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            onClick={submitReject}
                            disabled={!rejectReason.trim()}
                        >
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Cancel offer modal */}
            <Modal
                show={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Cancel Offer
                            </h2>
                            <p className="text-sm text-gray-600">
                                Offer #{cancelingDeal?.id}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Are you sure you want to cancel this offer? This action
                        cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => setCancelModalOpen(false)}
                        >
                            Keep Offer
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors"
                            onClick={submitCancel}
                        >
                            Cancel Offer
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Accept confirmation dialog */}
            <ConfirmDialog
                open={acceptModalOpen}
                setOpen={setAcceptModalOpen}
                title="Are you sure you want to accept this offer?"
                description="This action cannot be undone."
                onConfirm={handleAccept}
            />

            {/* 🔹 Agent / Broker Feedback Form */}
            {feedbackDeal && (
                <FeedbackForm
                    openFeedback={feedbackOpen}
                    setOpenFeedBack={(open) => {
                        setFeedbackOpen(open);
                        if (!open) {
                            setFeedbackDeal(null);
                            setFeedbackAgentId(null);
                        }
                    }}
                    agentId={feedbackAgentId}
                    transactionId={feedbackDeal.id}
                    // 🔹 By now, property_listing.agents already contains either:
                    // - original agents
                    // - OR one "broker" object treated as agent if no agents
                    agents={feedbackDeal.property_listing?.agents || []}
                />
            )}
        </AuthenticatedLayout>
    );
}
