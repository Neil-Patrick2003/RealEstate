// resources/js/Pages/Agents/Deal.jsx
import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faPen,
    faXmark,
    faReply,
    faMoneyBillWave,
    faHandshake,
    faTag,
    faUser,
    faClock,
    faHome,
    faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { router, useForm, usePage, Link, Head } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";

dayjs.extend(relativeTime);

/** ---------- helpers ---------- */
const peso = (v) =>
    typeof v === "number"
        ? v.toLocaleString("en-PH", { style: "currency", currency: "PHP" })
        : Number(v || 0).toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const STATUS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    RESERVED: "Reserved",
    SOLD: "Sold",
    CANCELLED: "Cancelled",
};

const statusStyles = {
    [STATUS.ACCEPTED]: "badge-success",
    [STATUS.REJECTED]: "badge-error",
    [STATUS.PENDING]: "badge-warning",
    [STATUS.CANCELLED]: "badge-gray",
    [STATUS.RESERVED]: "badge-primary",
    [STATUS.SOLD]: "badge-success",
    default: "badge-secondary",
};

export default function Deal({ property_listings }) {
    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;

    const listings = property_listings?.data ?? [];

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editMode, setEditMode] = useState("edit");

    const { data, setData, processing, errors, reset, put } = useForm({
        amount: "",
    });

    const isLastEditedByAuth = (deal) =>
        !!deal?.amount_last_updated_by && deal.amount_last_updated_by === authUserId;

    const openModal = (deal, listingId, mode = "edit") => {
        setSelectedDeal(deal);
        setSelectedListingId(listingId);
        setEditMode(mode);
        setData("amount", String(deal.amount || ""));
        setOpenUpdateForm(true);
    };

    const closeModal = () => {
        setOpenUpdateForm(false);
        setSelectedDeal(null);
        setSelectedListingId(null);
        setEditMode("edit");
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!selectedDeal) return;

        const payload = { amount: data.amount };

        put(
            route("agents.deals.update", {
                deal: selectedDeal.id,
            }),
            payload,
            {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: (err) => console.error(err),
            }
        );
    };

    const onStatusChange = (deal, status) => {
        setSelectedDeal(deal);
        setNewStatus(status);
        setConfirmModalOpen(true);
    };

    const handleConfirmUpdate = () => {
        if (!selectedDeal || !newStatus) return;
        handleUpdate(newStatus);
        setConfirmModalOpen(false);
        setOpenAcceptModal(false);
    };

    const handleUpdate = (status) => {
        if (!status || !selectedDeal) return;
        router.put(route('agents.deals.update_status', { deal: selectedDeal.id, status: status.toLowerCase() }), {}, {
            onSuccess: () => {
                setSelectedDeal(null);
                setNewStatus("");
                router.reload({ only: ['property_listings'] });
            },
            onError: (error) => {
                console.error("Failed to update status:", error);
            },
        });
    };

    const pageLinks = useMemo(() => property_listings?.links ?? [], [property_listings]);

    return (
        <BrokerLayout>
            <Head title="Deal Manager" />

            {/* Confirm: Accept / Reject Modal */}
            <ConfirmDialog
                open={openAcceptModal}
                onConfirm={handleConfirmUpdate}
                confirmText={newStatus}
                cancelText={"Cancel"}
                setOpen={setOpenAcceptModal}
                title={`Confirm ${newStatus}`}
                description={`Are you sure you want to mark this offer as "${newStatus}"? This will notify the buyer.`}
                variant={newStatus === STATUS.ACCEPTED ? "success" : "error"}
            />

            {/* Confirm: Status dropdown */}
            <ConfirmDialog
                open={confirmModalOpen}
                setOpen={setConfirmModalOpen}
                onConfirm={handleConfirmUpdate}
                confirmText="Confirm Update"
                cancelText="Cancel"
                title="Confirm Status Update"
                description={`Are you sure you want to change status to "${newStatus}"?`}
            />

            <div className="page-content space-y-6">
                {/* Header */}
                <div className="page-header">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Deal Manager</h1>
                            <p className="text-gray-600 mt-1">
                                Manage all incoming and negotiated buyer offers across your listings
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                Total listings: <span className="font-semibold text-gray-900">{property_listings?.total ?? listings.length}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {listings.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-gray-400 mb-4">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Listings with Deals</h3>
                        <p className="text-gray-500 mb-6">Add a property listing to start receiving offers</p>
                        <Link href="/broker/properties/create" className="btn-primary">
                            <FontAwesomeIcon icon={faHome} className="w-4 h-4 mr-2" />
                            Create New Listing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {listings.map((listing) => {
                            const offerCount = listing.deal?.length ?? 0;
                            const finalPrice = listing.property?.price ? peso(listing.property.price) : "—";

                            return (
                                <div key={listing.id} className="card">
                                    <InquiriesCollapsable
                                        header={
                                            <div className="flex w-full items-center justify-between gap-4 py-2">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="relative">
                                                        <img
                                                            src={
                                                                listing.property?.image_url
                                                                    ? `/storage/${listing.property.image_url}`
                                                                    : "/placeholder.png"
                                                            }
                                                            alt={listing.property?.title || "Property Image"}
                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        {offerCount > 0 && (
                                                            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                                                {offerCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-gray-900 truncate text-lg">
                                                            {listing.property?.title || "Untitled Property"}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 truncate mt-1 flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-400" />
                                                            {listing.property?.address || "No address provided"}
                                                        </p>
                                                        <p className="text-sm font-semibold text-primary mt-2 flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                                                            Listing Price: {finalPrice}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="mt-4">
                                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50">
                                                    <tr className="text-left text-xs uppercase text-gray-500 tracking-wider">
                                                        <th className="p-4 font-semibold w-16">#</th>
                                                        <th className="p-4 font-semibold min-w-[120px]">Buyer</th>
                                                        <th className="p-4 font-semibold min-w-[150px]">Listing Price</th>
                                                        <th className="p-4 font-semibold min-w-[150px]">Current Offer</th>
                                                        <th className="p-4 font-semibold min-w-[120px]">Status</th>
                                                        <th className="p-4 font-semibold min-w-[150px]">Last Negotiation</th>
                                                        <th className="p-4 font-semibold min-w-[300px] text-right">Actions</th>
                                                    </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-gray-100 bg-white">
                                                    {offerCount > 0 ? (
                                                        listing.deal.map((deal, idx) => {
                                                            const statusClass = statusStyles[deal.status] || statusStyles.default;
                                                            const lastEditedByYou = isLastEditedByAuth(deal);
                                                            const someoneElseEdited =
                                                                !!deal.amount_last_updated_by &&
                                                                deal.amount_last_updated_by !== authUserId;
                                                            const isActionable = deal.status === STATUS.PENDING;

                                                            return (
                                                                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                                                                    {/* Ordinal */}
                                                                    <td className="p-4">
                                                                            <span className="badge-gray text-xs font-medium">
                                                                                {ordinal(idx + 1)}
                                                                            </span>
                                                                    </td>

                                                                    {/* Buyer */}
                                                                    <td className="p-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="avatar-sm">
                                                                                <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                                                                            </div>
                                                                            <span className="font-medium text-gray-900">
                                                                                    {deal.buyer?.name ?? "Unnamed Buyer"}
                                                                                </span>
                                                                        </div>
                                                                    </td>

                                                                    {/* Listing Price */}
                                                                    <td className="p-4 text-gray-600 font-medium">
                                                                        {finalPrice}
                                                                    </td>

                                                                    {/* Current Offer */}
                                                                    <td className="p-4">
                                                                            <span className="font-bold text-lg text-emerald-700">
                                                                                {peso(deal.amount)}
                                                                            </span>
                                                                    </td>

                                                                    {/* Status */}
                                                                    <td className="p-4">
                                                                            <span className={`badge ${statusClass}`}>
                                                                                {deal.status}
                                                                            </span>
                                                                    </td>

                                                                    {/* Last Negotiation */}
                                                                    <td className="p-4">
                                                                        {deal.amount_last_updated_at ? (
                                                                            <div className="flex flex-col">
                                                                                    <span className="text-sm text-gray-900">
                                                                                        {dayjs(deal.amount_last_updated_at).format("MMM D, YYYY")}
                                                                                    </span>
                                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                                                                    {dayjs(deal.amount_last_updated_at).fromNow()}
                                                                                    </span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-400">—</span>
                                                                        )}
                                                                    </td>

                                                                    {/* Actions */}
                                                                    <td className="p-4">
                                                                        <div className="flex flex-col gap-3 items-end">
                                                                            {/* Contextual Note */}
                                                                            {someoneElseEdited && isActionable && (
                                                                                <div className="alert-warning w-full text-xs p-2">
                                                                                    <span className="font-semibold">New Offer Received:</span> The other party updated the amount. Please respond.
                                                                                </div>
                                                                            )}

                                                                            <div className="flex flex-wrap gap-2 justify-end">
                                                                                {isActionable ? (
                                                                                    <>
                                                                                        {/* EDIT / COUNTER button */}
                                                                                        {lastEditedByYou ? (
                                                                                            <button
                                                                                                onClick={() => openModal(deal, listing.id, "edit")}
                                                                                                className="btn-outline btn-sm"
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
                                                                                                Edit Offer
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() => openModal(deal, listing.id, "counter")}
                                                                                                className="btn-primary btn-sm"
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faReply} className="w-4 h-4 mr-2" />
                                                                                                Counter Offer
                                                                                            </button>
                                                                                        )}

                                                                                        {/* Accept / Decline only if last edit was by someone else */}
                                                                                        {someoneElseEdited && (
                                                                                            <>
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedDeal(deal);
                                                                                                        setNewStatus(STATUS.ACCEPTED);
                                                                                                        setOpenAcceptModal(true);
                                                                                                    }}
                                                                                                    className="btn-success btn-sm"
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                                                                                                    Accept
                                                                                                </button>

                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedDeal(deal);
                                                                                                        setNewStatus(STATUS.REJECTED);
                                                                                                        setOpenAcceptModal(true);
                                                                                                    }}
                                                                                                    className="btn-error btn-sm"
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4 mr-2" />
                                                                                                    Decline
                                                                                                </button>
                                                                                            </>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    // Post-Negotiation Actions
                                                                                    <div className="flex gap-2">
                                                                                        {deal.status.toLowerCase() === 'accepted' ? (
                                                                                            <>
                                                                                                <Link
                                                                                                    href={route('broker.deals.finalize', { deal: deal.id })}
                                                                                                    className="btn-success btn-sm"
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faHandshake} className="w-4 h-4 mr-2" />
                                                                                                    Finalize Deal
                                                                                                </Link>
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedDeal(deal);
                                                                                                        setNewStatus(STATUS.CANCELLED);
                                                                                                        setOpenAcceptModal(true);
                                                                                                    }}
                                                                                                    className="btn-outline btn-sm text-gray-700"
                                                                                                >
                                                                                                    Cancel Deal
                                                                                                </button>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span className="text-gray-500 text-sm italic">
                                                                                                    No further actions available
                                                                                                </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="py-8 text-center text-gray-400">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <FontAwesomeIcon icon={faMoneyBillWave} className="w-8 h-8 text-gray-300" />
                                                                    <p>No deals for this listing yet</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </InquiriesCollapsable>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pageLinks.length > 3 && (
                    <div className="flex flex-wrap gap-2 justify-center items-center">
                        {pageLinks.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`btn-sm ${
                                        link.active
                                            ? "btn-primary"
                                            : "btn-outline text-gray-700"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="btn-sm btn-outline text-gray-400 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>
                )}

                {/* Edit/Counter Amount Modal */}
                <Modal show={openUpdateForm} onClose={closeModal} maxWidth="sm" closeable>
                    <form onSubmit={submit} className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={editMode === "edit" ? faPen : faReply} className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editMode === "edit" ? "Edit Offer Amount" : "Send Counter Offer"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editMode === "edit"
                                        ? "Update your previously submitted offer amount"
                                        : "Respond to the buyer with a new proposed price"}
                                </p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Offer Amount (PHP)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₱</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={data.amount}
                                    onChange={(e) => setData("amount", e.target.value)}
                                    className="form-input pl-10 text-lg font-semibold"
                                    autoFocus
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.amount && (
                                <p className="form-error">{errors.amount}</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="btn-secondary"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`btn ${
                                    editMode === "edit"
                                        ? "btn-primary"
                                        : "btn-success"
                                }`}
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="spinner-sm" />
                                        Sending...
                                    </div>
                                ) : editMode === "edit" ? (
                                    "Update Offer"
                                ) : (
                                    "Send Counter Offer"
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </BrokerLayout>
    );
}
