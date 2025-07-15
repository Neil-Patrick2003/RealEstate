import AgentLayout from "@/Layouts/AgentLayout.jsx";
import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCheck, faPen} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import dayjs from "dayjs";
import {router, useForm, usePage} from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import {Select} from "@mui/material"; // assuming you have a reusable Modal component

export default function Deal({ property_listing,  }) {

    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;

    const listings = property_listing?.data ?? [];

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);
    const [openCancelModal, setCancelModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);


    const { data, setData, processing, errors, reset, put } = useForm({
        amount: "",
    });

    const statusStyles = {
        accepted: "bg-green-100 text-green-700 ring-green-200",
        rejected: "bg-red-100 text-red-700 ring-red-200",
        pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
        cancelled: "bg-gray-100 text-gray-700 ring-gray-200",
        default: "bg-orange-100 text-orange-700 ring-orange-200",
    };

    const openModal = (deal, listingId) => {
        setSelectedDeal(deal);
        setSelectedListingId(listingId);
        setData("amount", deal.amount || "");
        setOpenUpdateForm(true);
    };

    const closeModal = () => {
        setOpenUpdateForm(false);
        setSelectedDeal(null);
        setSelectedListingId(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();

        if (!selectedDeal || !selectedListingId) return;

        put(route("agents.deals.update", {
            deal: selectedDeal.id,
        }), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: (err) => console.error(err),
        });
    };

    const handleAccept = () => {
        if (!selectedDeal) return;


        router.put(`/agents/deal/${selectedDeal.id}/accept`, {}, {
            onSuccess: () => {
                setSelectedDeal(null);
                setOpenAcceptModal(false);
            },
            onError: (errors) => {
                console.error('Error accepting deal:', errors);
            }
        });
    };


    const onStatusChange = (deal, status) => {
        setSelectedDeal(deal);    // Save which deal is being updated
        setNewStatus(status);     // Save new status from select
        setConfirmModalOpen(true); // Show confirmation modal
    };

    const handleConfirmUpdate = () => {
        if (!selectedDeal || !newStatus) return;

        handleUpdate(newStatus);  // Your existing update function

        setConfirmModalOpen(false);
    };

    const handleUpdate = (status) => {
        if (!status || !selectedDeal) return;

        router.put(`/agents/deal/${selectedDeal.id}/${status}`, {}, {
            onSuccess: () => {
                setSelectedDeal(null);
                setNewStatus('');
            },
            onError: (error) => {
                console.error('Failed to update status:', error);
            },
        });
    };





    return (
        <AgentLayout>
            <ConfirmDialog open={openAcceptModal} onConfirm={handleAccept} confirmText={'Accept'} cancelText={'Cancel'}  setOpen={setOpenAcceptModal} title={'Accept Offer amount'} description={'Are you sure you want to accept this offer amount?'} />
            <ConfirmDialog
                open={confirmModalOpen}
                setOpen={setConfirmModalOpen}
                onConfirm={handleConfirmUpdate}
                confirmText="Confirm"
                cancelText="Cancel"
                title="Confirm Status Update"
                description={`Are you sure you want to change status to "${newStatus}"?`}
            />

            <h2 className="text-xl font-semibold mb-4">Deals</h2>

            {listings.length === 0 ? (
                <p className="text-gray-500">No listings available.</p>
            ) : (
                listings.map((listing) => (
                    <InquiriesCollapsable
                        key={listing.id}
                        header={
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={listing.property?.image_url ? `/storage/${listing.property.image_url}` : "/placeholder.png"}
                                        alt={listing.property?.title || "Property Image"}
                                        className="w-16 h-16 object-cover rounded"
                                        onError={(e) => (e.target.src = "/placeholder.png")}
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {listing.property?.title || "Untitled Property"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {listing.property?.address || "No address provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto bg-white shadow-sm rounded-lg mt-4">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                                <tr>
                                    <th className="p-3">Buyer</th>
                                    <th className="p-3">Original Price</th>
                                    <th className="p-3">Offer</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Last Update</th>
                                    <th className="p-3">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed">
                                {listing.deal&& listing.deal.length > 0 ? (
                                    listing.deal.map((deal) => {
                                        const property = listing.property;
                                        const statusClass = statusStyles[deal.status] || statusStyles.default;

                                        return (
                                            <tr key={deal.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                                <td className="p-3 md:table-cell">{deal.buyer?.name ?? "Unnamed Buyer"}</td>
                                                <td className="p-3 md:table-cell">
                                                    {listing?.property?.price
                                                        ? Number(listing.property.price).toLocaleString("en-PH", {
                                                            style: "currency",
                                                            currency: "PHP",
                                                        })
                                                        : "₱0.00"}
                                                </td>
                                                <td className="p-3 md:table-cell">
                                                    {deal.amount
                                                        ? Number(deal.amount).toLocaleString("en-PH", {
                                                            style: "currency",
                                                            currency: "PHP",
                                                        })
                                                        : "₱0.00"}
                                                </td>
                                                <td className="p-3 md:table-cell">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}>
                                                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-3 md:table-cell">
                                                    {deal.amount_last_updated_at
                                                        ? dayjs(deal.amount_last_updated_at).format("MMM D, YYYY h:mm A")
                                                        : "—"}
                                                </td>
                                                <td className="p-3 md:table-cell">

                                                    {deal.status === 'Pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => openModal(deal, listing.id)}
                                                                className="text-secondary border border-secondary px-4 mr-2 py-2 rounded-md mr-2"
                                                            >
                                                                <FontAwesomeIcon icon={faPen} className='mr-2' />
                                                                Edit
                                                            </button>
                                                            {deal.amount_last_updated_by &&
                                                                deal.amount_last_updated_by !== authUserId && (
                                                                    <button
                                                                        onClick={() => { setSelectedDeal(deal); setOpenAcceptModal(true);}}
                                                                        className="text-primary border border-primary px-4 py-2 rounded-md hover:text-accent"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCheck} className='mr-2' />
                                                                        Accept
                                                                    </button>
                                                                )}
                                                        </>

                                                    ) : (
                                                        <select
                                                            value={deal.status}
                                                            onChange={(e) => onStatusChange(deal, e.target.value)}
                                                            className="border border-primary text-primary rounded-md py-1.5"
                                                        >
                                                            <option >Accepted</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                            <option value="Sold">Sold</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-400">
                                            No deals for this listing.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </InquiriesCollapsable>
                ))
            )}

            {/* Modal for editing deal */}
            <Modal show={openUpdateForm} onClose={closeModal} maxWidth="sm" closeable>
                <form onSubmit={submit} className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Update Offer Amount</h3>

                    <label className="block mb-2 font-medium text-gray-700">Amount (₱)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.amount}
                        onChange={(e) => setData("amount", e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-1 focus:outline-none focus:ring focus:ring-primary"
                    />
                    {errors.amount && (
                        <p className="text-red-600 text-xs mb-2">{errors.amount}</p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded bg-primary text-white hover:bg-accent disabled:opacity-50"
                        >
                            {processing ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AgentLayout>
    );
}
