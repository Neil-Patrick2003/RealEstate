// resources/js/Pages/Agents/Deal.jsx
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPen, faXmark, faReply, faMoneyBillWave, faHandshake, faBell, faCircle } from "@fortawesome/free-solid-svg-icons";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { router, useForm, usePage, Link, Head } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

dayjs.extend(relativeTime);

/** ---------- helpers ---------- */
const cn = (...classes) => classes.filter(Boolean).join(' ');
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
    default: "badge-warning",
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
    const [viewMode, setViewMode] = useState("all"); // 'all', 'new', 'pending'

    const { data, setData, processing, errors, reset, put } = useForm({
        amount: "",
    });

    // Check if deal has new offers that need attention
    const hasNewOffers = (deal) => {
        return deal.status === STATUS.PENDING &&
            deal.amount_last_updated_by &&
            deal.amount_last_updated_by !== authUserId;
    };

    // Check if listing has any new offers
    const listingHasNewOffers = (listing) => {
        return listing.deal?.some(deal => hasNewOffers(deal));
    };

    // Count new offers for a listing
    const countNewOffers = (listing) => {
        return listing.deal?.filter(deal => hasNewOffers(deal)).length || 0;
    };

    // Count total new offers across all listings
    const totalNewOffers = useMemo(() => {
        return listings.reduce((total, listing) => total + countNewOffers(listing), 0);
    }, [listings]);

    // Filter listings based on view mode
    const filteredListings = useMemo(() => {
        switch (viewMode) {
            case 'new':
                return listings.filter(listing => listingHasNewOffers(listing));
            case 'pending':
                return listings.filter(listing =>
                    listing.deal?.some(deal => deal.status === STATUS.PENDING)
                );
            default:
                return listings;
        }
    }, [listings, viewMode]);

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
            }), payload,
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
        router.put(route('agents.deals.update_status', { id: selectedDeal.id, status: status.toLowerCase() }), {}, {
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
        <AuthenticatedLayout>
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

            <div className="page-container">
                <div className="page-content space-y-6">
                    {/* Header with New Offers Banner */}
                    {totalNewOffers > 0 && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faBell} className="w-6 h-6 animate-pulse" />
                                    <div>
                                        <h3 className="font-bold text-lg">New Offers Awaiting Your Response!</h3>
                                        <p className="text-blue-100 text-sm">
                                            You have {totalNewOffers} new offer{totalNewOffers !== 1 ? 's' : ''} that need your attention.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewMode('new')}
                                    className="btn btn-sm bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                                >
                                    View New Offers
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="section">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 gradient-text">Deal Manager</h1>
                                <p className="section-description">
                                    Manage all incoming and negotiated buyer offers across your listings.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                    <span className="font-bold text-lg text-gray-700">{property_listings?.total ?? listings.length}</span> total listings
                                </span>
                                {totalNewOffers > 0 && (
                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        <FontAwesomeIcon icon={faCircle} className="w-2 h-2 animate-pulse" />
                                        {totalNewOffers} new offer{totalNewOffers !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* View Mode Tabs */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => setViewMode('all')}
                                className={cn(
                                    "btn btn-sm",
                                    viewMode === 'all' ? 'btn-primary' : 'btn-outline'
                                )}
                            >
                                All Listings
                            </button>
                            <button
                                onClick={() => setViewMode('pending')}
                                className={cn(
                                    "btn btn-sm",
                                    viewMode === 'pending' ? 'btn-primary' : 'btn-outline'
                                )}
                            >
                                Pending Offers
                            </button>
                            {totalNewOffers > 0 && (
                                <button
                                    onClick={() => setViewMode('new')}
                                    className={cn(
                                        "btn btn-sm relative flex items-center gap-2",
                                        viewMode === 'new'
                                            ? "btn-primary"
                                            : "btn-outline border-red-200 text-red-700 hover:bg-red-50"
                                    )}
                                >
                                    <FontAwesomeIcon icon={faBell} className="w-4 h-4" />
                                    <span>New Offers</span>

                                    {/* Badge */}
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                        {totalNewOffers}
                                    </span>
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Listings */}
                    {filteredListings.length === 0 ? (
                        <div className="card p-12 text-center">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {viewMode === 'new' ? 'No New Offers' :
                                    viewMode === 'pending' ? 'No Pending Offers' :
                                        'No Active Listings with Deals'}
                            </h3>
                            <p className="text-gray-500">
                                {viewMode === 'new' ? 'All new offers have been addressed.' :
                                    viewMode === 'pending' ? 'No pending offers at the moment.' :
                                        'Add a property listing to start receiving offers.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredListings.map((listing) => {
                                const offerCount = listing.deal?.length ?? 0;
                                const finalPrice = listing.property?.price ? peso(listing.property.price) : "—";
                                const newOffersCount = countNewOffers(listing);
                                const hasNew = newOffersCount > 0;

                                return (
                                    <div key={listing.id} className={cn(
                                        "card relative",
                                        hasNew && "ring-2 ring-blue-500 ring-opacity-50"
                                    )}>
                                        {/* New Offer Indicator */}
                                        {hasNew && (
                                            <div className="absolute -top-2 -right-2">
                                                <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold animate-pulse">
                                                    {newOffersCount} NEW
                                                </span>
                                            </div>
                                        )}

                                        <InquiriesCollapsable
                                            header={
                                                <div className="flex w-full items-center justify-between gap-4 py-2">
                                                    <div className="flex items-center gap-4 min-w-0">
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
                                                            {hasNew && (
                                                                <FontAwesomeIcon
                                                                    icon={faCircle}
                                                                    className="absolute -top-1 -right-1 w-3 h-3 text-red-500 animate-pulse"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="leading-snug min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-gray-900 truncate text-lg">
                                                                    {listing.property?.title || "Untitled Property"}
                                                                </p>
                                                                {hasNew && (
                                                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                                        {newOffersCount} new offer{newOffersCount !== 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 truncate mt-0.5">
                                                                {listing.property?.address || "No address provided"}
                                                            </p>
                                                            <p className="text-sm font-semibold text-primary-600 mt-1">
                                                                Listing Price: {finalPrice}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={cn(
                                                            "badge",
                                                            hasNew ? "badge-primary" : "badge-gray"
                                                        )}>
                                                            {hasNew ? "New Offers" : "Offers Received"}
                                                        </span>
                                                        <span className={cn(
                                                            "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-base font-bold",
                                                            hasNew ? "bg-red-500 text-white" : "bg-primary-600 text-white"
                                                        )}>
                                                            {offerCount}
                                                        </span>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div className="mt-4">
                                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                    <table className="min-w-full text-sm text-left text-gray-800">
                                                        <thead className="bg-gray-50">
                                                        <tr className="text-xs uppercase tracking-wider text-gray-500">
                                                            <th className="p-4 w-16">#</th>
                                                            <th className="p-4 min-w-[120px]">Buyer</th>
                                                            <th className="p-4 min-w-[150px]">Listing Price</th>
                                                            <th className="p-4 min-w-[150px]">Current Offer</th>
                                                            <th className="p-4 min-w-[120px]">Status</th>
                                                            <th className="p-4 min-w-[150px]">Last Negotiation</th>
                                                            <th className="p-4 min-w-[300px]">Action</th>
                                                        </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-gray-100">
                                                        {offerCount > 0 ? (
                                                            listing.deal.map((deal, idx) => {
                                                                const property = listing.property;
                                                                const statusClass = statusStyles[deal.status] || statusStyles.default;
                                                                const isNewOffer = hasNewOffers(deal);
                                                                const lastEditedByYou = isLastEditedByAuth(deal);
                                                                const someoneElseEdited =
                                                                    !!deal.amount_last_updated_by &&
                                                                    deal.amount_last_updated_by !== authUserId;

                                                                const isActionable = deal.status === STATUS.PENDING;

                                                                return (
                                                                    <tr key={deal.id} className={cn(
                                                                        "hover:bg-gray-50 transition",
                                                                        isNewOffer && "bg-blue-50 border-l-4 border-l-blue-500"
                                                                    )}>
                                                                        {/* ordinal */}
                                                                        <td className="p-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="badge-gray">
                                                                                    {ordinal(idx + 1)}
                                                                                </span>
                                                                                {isNewOffer && (
                                                                                    <FontAwesomeIcon
                                                                                        icon={faCircle}
                                                                                        className="w-2 h-2 text-blue-500 animate-pulse"
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </td>

                                                                        <td className="p-4 font-medium">
                                                                            <div className="flex items-center gap-2">
                                                                                {deal.buyer?.name ?? "Unnamed Buyer"}
                                                                                {isNewOffer && (
                                                                                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                                                                        NEW
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>

                                                                        <td className="p-4 text-gray-600">
                                                                            {finalPrice}
                                                                        </td>

                                                                        <td className="p-4 font-bold text-lg text-green-700">
                                                                            {peso(deal.amount)}
                                                                        </td>

                                                                        <td className="p-4">
                                                                          <span className={cn("badge", statusClass)}>
                                                                            {deal.status}
                                                                          </span>
                                                                        </td>

                                                                        <td className="p-4 text-gray-600">
                                                                            {deal.amount_last_updated_at ? (
                                                                                <div className="flex flex-col">
                                                                                  <span className="text-sm">
                                                                                    {dayjs(deal.amount_last_updated_at).format(
                                                                                        "MMM D, YYYY"
                                                                                    )}
                                                                                  </span>
                                                                                    <span className="text-xs text-gray-500">
                                                                                    {dayjs(deal.amount_last_updated_at).fromNow()}
                                                                                  </span>
                                                                                </div>
                                                                            ) : (
                                                                                "—"
                                                                            )}
                                                                        </td>

                                                                        <td className="p-4">
                                                                            {isActionable ? (
                                                                                <div className="flex flex-col gap-3">
                                                                                    {/* Contextual Note */}
                                                                                    {isNewOffer && (
                                                                                        <div className="alert-info p-3 rounded-md border-l-4 border-l-blue-500">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-blue-500" />
                                                                                                <span className="font-semibold">New Offer Received!</span> The buyer has made a new offer that needs your response.
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                        {/* EDIT / COUNTER button */}
                                                                                        {lastEditedByYou ? (
                                                                                            <button
                                                                                                onClick={() => openModal(deal, listing.id, "edit")}
                                                                                                className="btn btn-outline btn-sm"
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                                                                                                Edit Last Offer
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() => openModal(deal, listing.id, "counter")}
                                                                                                className="btn btn-primary btn-sm"
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faReply} className="w-4 h-4" />
                                                                                                Counter Price
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
                                                                                                    className="btn btn-success btn-sm"
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                                                                                                    Accept
                                                                                                </button>

                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedDeal(deal);
                                                                                                        setNewStatus(STATUS.REJECTED);
                                                                                                        setOpenAcceptModal(true);
                                                                                                    }}
                                                                                                    className="btn btn-error btn-sm"
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                                                                                                    Decline
                                                                                                </button>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                // Post-Negotiation Actions
                                                                                <div className="flex gap-2">
                                                                                    {deal.status.toLowerCase() === 'accepted' ? (
                                                                                        <>
                                                                                            <Link
                                                                                                href={route('agents.deals.finalize', { deal: deal.id })}
                                                                                                className="btn btn-primary btn-sm"
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faHandshake} />
                                                                                                Finalize Deal
                                                                                            </Link>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setSelectedDeal(deal);
                                                                                                    setNewStatus(STATUS.CANCELLED);
                                                                                                    setOpenAcceptModal(true);
                                                                                                }}
                                                                                                className="btn btn-outline btn-sm"
                                                                                            >
                                                                                                Cancel Deal
                                                                                            </button>
                                                                                        </>
                                                                                    ) : (
                                                                                        <span className="text-gray-500 italic text-sm">
                                                                                            No further action required. Status: {deal.status}.
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="py-8 text-center text-gray-400">
                                                                    No deals for this listing yet.
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
                    {pageLinks.length > 0 && (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {pageLinks.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={cn(
                                            "btn btn-sm",
                                            link.active
                                                ? "btn-primary"
                                                : "btn-outline"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="btn btn-outline btn-sm cursor-not-allowed opacity-50"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    )}

                    {/* Edit/Counter Amount Modal */}
                    <Modal show={openUpdateForm} onClose={closeModal} maxWidth="sm" closeable>
                        <form onSubmit={submit} className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">
                                {editMode === "edit" ? "Edit Your Offer Amount" : "Send Counter Price"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4 border-b pb-3">
                                {editMode === "edit"
                                    ? "Update the offer amount you previously submitted. This will refresh the negotiation."
                                    : "Enter your counter amount to respond to the buyer's latest offer. This is the new proposed price."}
                            </p>

                            <div className="form-group">
                                <label className="form-label">
                                    Amount (PHP)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₱</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={data.amount}
                                        onChange={(e) => setData("amount", e.target.value)}
                                        className="form-input pl-8 text-lg font-bold"
                                        autoFocus
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
                                    className="btn btn-secondary btn-sm"
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={cn(
                                        "btn btn-sm text-white shadow-md",
                                        editMode === "edit"
                                            ? "btn-secondary"
                                            : "btn-primary"
                                    )}
                                >
                                    {processing
                                        ? "Sending..."
                                        : editMode === "edit"
                                            ? "Update Offer"
                                            : "Send Counter Offer"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
