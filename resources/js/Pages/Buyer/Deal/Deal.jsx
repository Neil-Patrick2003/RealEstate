import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCheck, faPen} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/Components/Modal.jsx";
import {router, useForm, usePage, Link} from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import dayjs from "dayjs";

export default function DealsPage({ deals }){
    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;
    const { data, setData, errors, processing,   reset, put} = useForm({
        amount: ''
    })

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);


    const statusStyles = {
        Accepted: "bg-green-100 text-green-700 ring-green-200",
        Cancelled: "bg-red-100 text-red-700 ring-red-200",
        Pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
        default: "bg-orange-100 text-orange-700 ring-orange-200",
    };

    const openModal = (deal) => {
        setSelectedDeal(deal);
        setData("amount", deal.amount || "");
        setOpenUpdateModal(true);
    };

    const closeModal = () => {
        setOpenUpdateModal(false);
        setSelectedDeal(null);
       reset();
    };

    const submit = (e) => {
        e.preventDefault();

        if (!selectedDeal) return;

        put(route('deal.deals.update', { propertyListing: selectedDeal.property_listing?.id, deal: selectedDeal?.id }), {
            onError: (error) => console.log(error),
            onSuccess: () => setOpenUpdateModal(false),
        })
    };

    const handleAccept = () => {
        if (!selectedDeal) return;

        router.put(`/deal/${selectedDeal.id}/accept`, {}, {
            onSuccess: () => {
                setSelectedDeal(null);
                setOpenAcceptModal(false);
            },
            onError: (errors) => {
                console.error('Error accepting deal:', errors);
            }
        });
    };

    return (
        <BuyerLayout>
            <ConfirmDialog open={openAcceptModal} onConfirm={handleAccept} confirmText={'Accept'} cancelText={'Cancel'}  setOpen={setOpenAcceptModal} title={'Accept Offer amount'} description={'Are you sure you want to accept this offer amount?'} />
            <Modal show={openUpdateModal} onClose={closeModal} closeable maxWidth="sm">
                <form onSubmit={submit} className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Update Offer Amount</h3>

                    <label className="block mb-2 font-medium text-gray-700">Amount (₱)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        id='amount'
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

            <div className="mt-20 border h-[82vh] rounded-2xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 px-6 pt-4">My Deals</h2>
                <div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                        <tr>
                            <th className="p-3">Property</th>
                            <th className="p-3">Original Price</th>
                            <th className="p-3">My Offer</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Last Update</th>
                            <th className="p-3">Action</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-dashed">
                        {deals?.length > 0 ? (
                            deals.map((deal) => {
                                const property = deal?.property_listing?.property;
                                const statusClass = statusStyles[deal.status] || statusStyles.default;

                                return (
                                    <tr
                                        key={deal.id}
                                        className="hover:bg-gray-50 flex flex-col md:table-row w-full"
                                    >
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        property?.image_url
                                                            ? `/storage/${property.image_url}`
                                                            : "/placeholder.png"
                                                    }
                                                    alt={property?.title ?? "Property"}
                                                    className="w-14 h-14 object-cover rounded-md"
                                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {property?.title ?? "Unknown Property"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {property?.address ?? "No address"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 md:table-cell">
                                            <p className="text-primary font-medium">
                                                {property?.price
                                                    ? Number(property.price).toLocaleString("en-PH", {
                                                        style: "currency",
                                                        currency: "PHP",
                                                    })
                                                    : "₱0.00"}
                                            </p>
                                        </td>
                                        <td className="p-3 md:table-cell">
                                            <p className="text-primary font-medium">
                                                {deal?.amount
                                                    ? Number(deal.amount).toLocaleString("en-PH", {
                                                        style: "currency",
                                                        currency: "PHP",
                                                    })
                                                    : "₱0.00"}
                                            </p>
                                        </td>
                                        <td className="p-3 md:table-cell">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}
                                            >
                                                {deal.status === 'Accepted' ? (
                                                    <span>Accepted - Proceeding with paperwork</span>
                                                ) : (
                                                    <span>{deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}</span>
                                                )}

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
                                                        onClick={() => openModal(deal)}
                                                        className="text-secondary border border-secondary px-4 py-2 rounded-md mr-2"
                                                    >
                                                        <FontAwesomeIcon icon={faPen} className='mr-2'/>
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
                                                <p className='text-gray-400'>No actions available</p>
                                            )}




                                        </td>
                                    </tr>
                                );
                            })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-400">
                                        No deals found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </BuyerLayout>
    );
}
