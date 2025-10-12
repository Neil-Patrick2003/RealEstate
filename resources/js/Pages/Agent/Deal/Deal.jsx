import AgentLayout from "@/Layouts/AgentLayout.jsx";
import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { router, useForm, usePage, Link, Head } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

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
    [STATUS.ACCEPTED]: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    [STATUS.REJECTED]: "bg-rose-100 text-rose-700 ring-rose-200",
    [STATUS.PENDING]: "bg-amber-100 text-amber-800 ring-amber-200",
    [STATUS.CANCELLED]: "bg-gray-100 text-gray-700 ring-gray-200",
    [STATUS.RESERVED]: "bg-blue-100 text-blue-700 ring-blue-200",
    [STATUS.SOLD]: "bg-green-100 text-green-700 ring-green-200",
    default: "bg-orange-100 text-orange-700 ring-orange-200",
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
        setData("amount", deal.amount || "");
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

        // same route; backend can track who changed it and treat as counter if not last editor
        put(
            route("agents.deals.update", {
                deal: selectedDeal.id,
            }),
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
        router.put(`/agents/deal/${selectedDeal.id}/${status}`, {}, {
            onSuccess: () => {
                setSelectedDeal(null);
                setNewStatus("");
            },
            onError: (error) => {
                console.error("Failed to update status:", error);
            },
        });
    };

    const pageLinks = useMemo(() => property_listings?.links ?? [], [property_listings]);

    return (
        <AgentLayout>
            <Head title="Deal" />

            {/* Confirm: Accept / Reject (explicit buttons) */}
            <ConfirmDialog
                open={openAcceptModal}
                onConfirm={handleConfirmUpdate}
                confirmText={"Confirm"}
                cancelText={"Cancel"}
                setOpen={setOpenAcceptModal}
                title={"Confirm Action"}
                description={`Are you sure you want to mark this offer as "${newStatus}"?`}
            />

            {/* Confirm: Status dropdown */}
            <ConfirmDialog
                open={confirmModalOpen}
                setOpen={setConfirmModalOpen}
                onConfirm={handleConfirmUpdate}
                confirmText="Confirm"
                cancelText="Cancel"
                title="Confirm Status Update"
                description={`Are you sure you want to change status to "${newStatus}"?`}
            />

            <div className="flex flex-col p-4 gap-4">
                <div className="flex items-center justify-between">
                    <header className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold text-gray-800">Agent Deals Manager</h1>
                        <p className="text-gray-500 text-sm">
                            Buyer offers management.
                        </p>
                    </header>
                    <span className="text-sm text-gray-500">
            {property_listings?.total ?? listings.length} total listings
          </span>
                </div>

                {listings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                        No listings available.
                    </div>
                ) : (
                    listings.map((listing) => {
                        const offerCount = listing.deal?.length ?? 0;

                        return (
                            <div className="mb-3" key={listing.id}>
                                <InquiriesCollapsable
                                    header={
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={
                                                        listing.property?.image_url
                                                            ? `/storage/${listing.property.image_url}`
                                                            : "/placeholder.png"
                                                    }
                                                    alt={listing.property?.title || "Property Image"}
                                                    className="w-16 h-16 object-cover rounded-lg ring-1 ring-gray-200"
                                                />
                                                <div className="leading-tight">
                                                    <p className="font-semibold text-gray-900">
                                                        {listing.property?.title || "Untitled Property"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {listing.property?.address || "No address provided"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-white text-xs">
                          Offers
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-gray-900">
                            {offerCount}
                          </span>
                        </span>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                                        <table className="min-w-full text-sm text-left text-gray-800">
                                            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="p-3">Order</th>
                                                <th className="p-3">Buyer</th>
                                                <th className="p-3">Original Price</th>
                                                <th className="p-3">Offer</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Last Update</th>
                                                <th className="p-3">Action</th>
                                            </tr>
                                            </thead>

                                            <tbody className="divide-y divide-dashed">
                                            {offerCount > 0 ? (
                                                listing.deal.map((deal, idx) => {
                                                    const property = listing.property;
                                                    const statusClass = statusStyles[deal.status] || statusStyles.default;

                                                    const lastEditedByYou = isLastEditedByAuth(deal);
                                                    const someoneElseEdited =
                                                        !!deal.amount_last_updated_by &&
                                                        deal.amount_last_updated_by !== authUserId;

                                                    const canAcceptReject =
                                                        deal.status === STATUS.PENDING && someoneElseEdited;

                                                    return (
                                                        <tr key={deal.id} className="hover:bg-gray-50 align-top">
                                                            {/* ordinal */}
                                                            <td className="p-3">
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                    {ordinal(idx + 1)}
                                  </span>
                                                            </td>

                                                            <td className="p-3">{deal.buyer?.name ?? "Unnamed Buyer"}</td>

                                                            <td className="p-3">
                                                                {property?.price ? peso(property.price) : "₱0.00"}
                                                            </td>

                                                            <td className="p-3 font-semibold">{peso(deal.amount)}</td>

                                                            <td className="p-3">
                                  <span
                                      className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}
                                  >
                                    {deal.status}
                                  </span>
                                                            </td>

                                                            <td className="p-3">
                                                                {deal.amount_last_updated_at ? (
                                                                    <div className="flex flex-col">
                                      <span>
                                        {dayjs(deal.amount_last_updated_at).format(
                                            "MMM D, YYYY h:mm A"
                                        )}
                                      </span>
                                                                        <span className="text-xs text-gray-500">
                                        {dayjs(deal.amount_last_updated_at).fromNow?.() || ""}
                                      </span>
                                                                    </div>
                                                                ) : (
                                                                    "—"
                                                                )}
                                                            </td>

                                                            <td className="p-3">
                                                                {deal.status === STATUS.PENDING ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        {/* NOTE if last edited by someone else */}
                                                                        {someoneElseEdited && (
                                                                            <p className="text-xs text-gray-500">
                                                                                The other party updated the offer. You can{" "}
                                                                                <span className="font-medium text-gray-700">
                                            counter, accept, or decline
                                          </span>
                                                                                .
                                                                            </p>
                                                                        )}

                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            {/* Edit or Counter button */}
                                                                            {lastEditedByYou ? (
                                                                                <button
                                                                                    onClick={() => openModal(deal, listing.id, "edit")}
                                                                                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-gray-800 hover:bg-gray-100"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                    Edit Amount
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => openModal(deal, listing.id, "counter")}
                                                                                    className="inline-flex items-center gap-2 rounded-md border border-blue-600 px-3 py-1.5 text-blue-700 hover:bg-blue-50"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                    Counter Price
                                                                                </button>
                                                                            )}

                                                                            {/* Accept / Decline only if last edit was by someone else */}
                                                                            {canAcceptReject && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setSelectedDeal(deal);
                                                                                            setOpenAcceptModal(true);
                                                                                            setNewStatus(STATUS.ACCEPTED);
                                                                                        }}
                                                                                        className="inline-flex items-center gap-2 rounded-md border border-emerald-600 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faCheck} />
                                                                                        Accept
                                                                                    </button>

                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setSelectedDeal(deal);
                                                                                            setOpenAcceptModal(true);
                                                                                            setNewStatus(STATUS.REJECTED);
                                                                                        }}
                                                                                        className="inline-flex items-center gap-2 rounded-md border border-rose-600 px-3 py-1.5 text-rose-700 hover:bg-rose-50"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faXmark} />
                                                                                        Decline
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <select
                                                                        value={deal.status}
                                                                        onChange={(e) => onStatusChange(deal, e.target.value)}
                                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800"
                                                                    >
                                                                        <option value={STATUS.RESERVED}>Reserved</option>
                                                                        <option value={STATUS.SOLD}>Sold</option>
                                                                        <option value={STATUS.CANCELLED}>Cancelled</option>
                                                                    </select>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="py-6 text-center text-gray-400">
                                                        No deals for this listing.
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
                    <div className="mt-4 flex items-center justify-end gap-2">
                        {pageLinks.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 text-sm font-medium rounded-md border transition ${
                                        link.active
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>
                )}

                {/* Edit/Counter Amount Modal */}
                <Modal show={openUpdateForm} onClose={closeModal} maxWidth="sm" closeable>
                    <form onSubmit={submit} className="p-6">
                        <h3 className="text-lg font-semibold mb-2">
                            {editMode === "edit" ? "Edit Offer Amount" : "Counter Price"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {editMode === "edit"
                                ? "Update the amount you last set."
                                : "Enter your counter amount to respond to the latest offer."}
                        </p>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Amount (₱)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="mb-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-200"
                        />
                        {errors.amount && (
                            <p className="text-xs text-rose-600 mb-2">{errors.amount}</p>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`rounded-md px-4 py-2 text-white disabled:opacity-50 ${
                                    editMode === "edit"
                                        ? "bg-gray-900 hover:bg-black/90"
                                        : "bg-blue-700 hover:bg-blue-800"
                                }`}
                            >
                                {processing
                                    ? "Saving..."
                                    : editMode === "edit"
                                        ? "Save Changes"
                                        : "Send Counter"}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AgentLayout>
    );
}
