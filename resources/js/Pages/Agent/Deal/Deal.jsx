// resources/js/Pages/Agents/Deal.jsx
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPen, faXmark, faReply, faMoneyBillWave, faHandshake } from "@fortawesome/free-solid-svg-icons";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { router, useForm, usePage, Link, Head } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

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
    [STATUS.ACCEPTED]: "bg-emerald-50 text-emerald-800 ring-emerald-50 border-emerald-300",
    [STATUS.REJECTED]: "bg-rose-50 text-rose-800 ring-rose-50 border-rose-300",
    [STATUS.PENDING]: "bg-amber-50 text-amber-800 ring-amber-50 border-amber-300",
    [STATUS.CANCELLED]: "bg-gray-50 text-gray-700 ring-gray-50 border-gray-300",
    [STATUS.RESERVED]: "bg-blue-50 text-blue-800 ring-blue-50 border-blue-300",
    [STATUS.SOLD]: "bg-green-50 text-green-800 ring-green-50 border-green-300",
    default: "bg-orange-50 text-orange-800 ring-orange-50 border-orange-300",
};

export default function Deal({ property_listings }) {
    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;

    const listings = property_listings?.data ?? [];

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false); // Used for Accept/Decline confirmations
    const [newStatus, setNewStatus] = useState("");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false); // Used for Status Dropdown confirmations (not used in final, but kept for future proofing)
    const [editMode, setEditMode] = useState("edit"); // 'edit' | 'counter'

    const { data, setData, processing, errors, reset, put } = useForm({
        amount: "",
    });

    const isLastEditedByAuth = (deal) =>
        !!deal?.amount_last_updated_by && deal.amount_last_updated_by === authUserId;

    const openModal = (deal, listingId, mode = "edit") => {
        setSelectedDeal(deal);
        setSelectedListingId(listingId);
        setEditMode(mode);
        // Ensure amount is formatted correctly for the input
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

        // Use a consistent value for the PUT request amount, ensuring it's a string/number
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

    // Original onStatusChange is slightly simplified as Accept/Decline now use openAcceptModal
    // This is primarily for future use if RESERVED/SOLD dropdown is re-added
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
                // Reload the page to get fresh data
                router.reload({ only: ['property_listings'] });
            },
            onError: (error) => {
                console.error("Failed to update status:", error);
            },
        });
    };

    const pageLinks = useMemo(() => property_listings?.links ?? [], [property_listings]);

    return (
        <AgentLayout>
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

            {/* Confirm: Status dropdown (kept for completeness) */}
            <ConfirmDialog
                open={confirmModalOpen}
                setOpen={setConfirmModalOpen}
                onConfirm={handleConfirmUpdate}
                confirmText="Confirm Update"
                cancelText="Cancel"
                title="Confirm Status Update"
                description={`Are you sure you want to change status to "${newStatus}"?`}
            />

            <div className="flex flex-col p-4 md:p-8 gap-6 ">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <header className="flex flex-col gap-1">
                        <h1 className="text-3xl font-extrabold text-gray-900">Agent Deals Manager</h1>
                        <p className="text-gray-600 text-base">
                            Manage all incoming and negotiated buyer offers across your listings.
                        </p>
                    </header>
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                        <span className="font-bold text-lg text-gray-700">{property_listings?.total ?? listings.length}</span> total listings
                    </span>
                </div>

                {listings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-lg">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No Active Listings with Deals.</p>
                        <p className="text-sm mt-1">Add a property listing to start receiving offers.</p>
                    </div>
                ) : (
                    listings.map((listing) => {
                        const offerCount = listing.deal?.length ?? 0;
                        const finalPrice = listing.property?.price ? peso(listing.property.price) : "—";

                        return (
                            <div className="mb-3" key={listing.id}>
                                <InquiriesCollapsable
                                    header={
                                        <div className="flex w-full items-center justify-between gap-4 py-1">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <img
                                                    src={
                                                        listing.property?.image_url
                                                            ? `/storage/${listing.property.image_url}`
                                                            : "/placeholder.png"
                                                    }
                                                    alt={listing.property?.title || "Property Image"}
                                                    className="w-16 h-16 object-cover rounded-xl ring-1 ring-gray-200 shadow-sm"
                                                />
                                                <div className="leading-snug min-w-0">
                                                    <p className="font-extrabold text-gray-900 truncate">
                                                        {listing.property?.title || "Untitled Property"}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                                        {listing.property?.address || "No address provided"}
                                                    </p>
                                                    <p className="text-sm font-bold text-primary mt-1">
                                                        Listing Price: {finalPrice}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="hidden sm:inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-600 text-xs font-medium border border-gray-200">
                                                    Offers Received
                                                </span>
                                                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-3 text-white text-base font-bold shadow-md">
                                                    {offerCount}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                                        <table className="min-w-full text-sm text-left text-gray-800">
                                            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                                            <tr>
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

                                                    const lastEditedByYou = isLastEditedByAuth(deal);
                                                    const someoneElseEdited =
                                                        !!deal.amount_last_updated_by &&
                                                        deal.amount_last_updated_by !== authUserId;

                                                    const isActionable = deal.status === STATUS.PENDING;

                                                    return (
                                                        <tr key={deal.id} className="hover:bg-gray-50 align-middle transition duration-150">
                                                            {/* ordinal */}
                                                            <td className="p-4">
                                                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
                                                                {ordinal(idx + 1)}
                                                              </span>
                                                            </td>

                                                            <td className="p-4 font-medium">{deal.buyer?.name ?? "Unnamed Buyer"}</td>

                                                            <td className="p-4 text-gray-600">
                                                                {finalPrice}
                                                            </td>

                                                            <td className="p-4 font-extrabold text-lg text-green-700">
                                                                {peso(deal.amount)}
                                                            </td>

                                                            <td className="p-4">
                                                              <span
                                                                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
                                                              >
                                                                {deal.status}
                                                              </span>
                                                            </td>

                                                            <td className="p-4 text-gray-600">
                                                                {deal.amount_last_updated_at ? (
                                                                    <div className="flex flex-col">
                                                                      <span>
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
                                                                        {someoneElseEdited && (
                                                                            <p className="text-xs text-gray-500 p-2 border-l-4 border-amber-400 bg-amber-50 rounded-r-md">
                                                                                <span className="font-semibold text-gray-700">New Offer Received:</span> The other party updated the amount. Please respond.
                                                                            </p>
                                                                        )}

                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            {/* EDIT / COUNTER button */}
                                                                            {lastEditedByYou ? (
                                                                                <button
                                                                                    onClick={() => openModal(deal, listing.id, "edit")}
                                                                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 font-medium hover:bg-gray-200 border border-gray-300 transition"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                                                                                    Edit Last Offer
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => openModal(deal, listing.id, "counter")}
                                                                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white font-semibold hover:bg-blue-700 shadow-md transition"
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
                                                                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white font-semibold hover:bg-emerald-700 shadow-md transition"
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
                                                                                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-white font-semibold hover:bg-rose-700 transition"
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
                                                                                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
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
                                                                                    className="inline-flex items-center border border-gray-300 rounded-lg text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition"
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
                                </InquiriesCollapsable>
                            </div>
                        );
                    })
                )}

                {/* Pagination */}
                {pageLinks.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                        {pageLinks.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition shadow-sm ${
                                        link.active
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed"
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

                        <label className="mb-1 block text-sm font-semibold text-gray-700">
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
                                className="mb-1 w-full rounded-lg border-gray-300 pl-8 pr-3 py-2 focus:border-primary focus:ring-primary/50 text-lg font-bold"
                                autoFocus
                            />
                        </div>

                        {errors.amount && (
                            <p className="text-xs text-rose-600 mb-2">{errors.amount}</p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 transition"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 shadow-md ${
                                    editMode === "edit"
                                        ? "bg-gray-900 hover:bg-black"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
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
        </AgentLayout>
    );
}
