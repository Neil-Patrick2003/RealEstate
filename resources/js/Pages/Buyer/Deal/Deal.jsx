import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import React, { useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

export default function DealsPage({ deals }) {
    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;
    const unreadNotifications = auth?.notifications?.unread ?? [];

    const counterOffers = unreadNotifications.filter(notification =>
        notification?.data?.message?.toLowerCase().includes("counter your offer")
    );

    const { data, setData, errors, processing, reset, put } = useForm({ amount: '' });

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);

    const statusStyles = {
        Accepted: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
        Pending: "bg-yellow-100 text-yellow-700",
        default: "bg-gray-100 text-gray-700",
    };

    const openModal = deal => {
        setSelectedDeal(deal);
        setData("amount", deal.amount || "");
        setOpenUpdateModal(true);
    };

    const closeModal = () => {
        setOpenUpdateModal(false);
        setSelectedDeal(null);
        reset();
    };

    const submit = e => {
        e.preventDefault();
        if (!selectedDeal) return;

        put(route("deal.deals.update", {
            propertyListing: selectedDeal.property_listing?.id,
            deal: selectedDeal.id
        }), {
            onSuccess: () => setOpenUpdateModal(false),
        });
    };

    const handleUpdateStatus = () => {
        if (!selectedDeal || !selectedStatus) return;
        router.put(`/deal/${selectedDeal.id}/${selectedStatus}`, {}, {
            onSuccess: () => {
                setOpenAcceptModal(false);
                setSelectedDeal(null);
            }
        });
    };

    const markAsRead = id =>
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });

    return (
        <BuyerLayout>
            <ConfirmDialog
                open={openAcceptModal}
                onConfirm={handleUpdateStatus}
                confirmText="Confirm"
                cancelText="Cancel"
                setOpen={setOpenAcceptModal}
                title="Confirm Offer Status"
                description="Please confirm this action."
            />

            {/* Counter Offers Banner */}
            <AnimatePresence>
                {counterOffers.length > 0 && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
                    >
                        <div className="flex items-center justify-between bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow">
              <span>
                {counterOffers.length} counter offer{counterOffers.length > 1 && "s"}
              </span>
                            <button onClick={() => counterOffers.forEach(n => markAsRead(n.id))}
                                    className="text-yellow-600 hover:text-yellow-800"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Update Modal (already handles own animation) */}
            <Modal show={openUpdateModal} onClose={closeModal} closeable maxWidth="sm">
                <motion.form
                    onSubmit={submit}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 bg-white rounded-lg shadow-lg"
                >
                    <h3 className="text-xl font-semibold mb-4">Edit Offer</h3>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.amount}
                        onChange={e => setData("amount", e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-500"
                    />
                    {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <motion.button whileTap={{ scale: 0.95 }} type="button"
                                       onClick={closeModal}
                                       className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                       disabled={processing}>
                            Cancel
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} type="submit"
                                       className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                       disabled={processing}>
                            {processing ? "Updating..." : "Update"}
                        </motion.button>
                    </div>
                </motion.form>
            </Modal>

            {/* Notification Cards */}
            <div className="mt-28 px-4 sm:px-6 lg:px-8 space-y-6">
                <AnimatePresence>
                    {counterOffers.map(notif => (
                        <motion.div key={notif.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative p-4 bg-white border rounded shadow"
                        >
                            <p>{notif.data.message}</p>
                            <p className="text-xs text-gray-500">Submitted {notif.created_at}</p>
                            <button
                                onClick={() => markAsRead(notif.id)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Deals List */}
                {deals.length > 0 ? (
                    deals.map(deal => {
                        const property = deal.property_listing.property;
                        const agent = deal.property_listing.agent;
                        const isOwnerUpdate = deal.amount_last_updated_by === authUserId;
                        const statusClass = statusStyles[deal.status] || statusStyles.default;

                        return (
                            <motion.div key={deal.id}
                                        initial={{ opacity:0, y:20 }}
                                        animate={{ opacity:1, y:0 }}
                                        transition={{ duration:0.4 }}
                                        className="bg-white rounded-lg border shadow-md p-6 space-y-6 hover:shadow-lg"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Property Info */}
                                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <img
                                            src={`/storage/${property?.image_url}`}
                                            alt={property?.title}
                                            className="rounded-lg object-cover w-full h-64"
                                        />
                                        <div className="space-y-2">
                                            <h2 className="text-lg font-bold text-gray-800">{property?.title}</h2>
                                            <p className="text-sm text-gray-500">{property?.address}</p>
                                            <div className="space-y-1 text-sm text-gray-700">
                                                <div className="flex justify-between"><span>Price</span><span>₱{property.price?.toLocaleString()}</span></div>
                                                <div className="flex justify-between font-semibold text-green-600"><span>Offer</span><span>₱{deal.amount?.toLocaleString()}</span></div>
                                                <div className="flex justify-between"><span>Type</span><span>{property.property_type}</span></div>
                                                <div className="flex justify-between"><span>Area</span><span>{property.lot_area} m²</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agent Info & Actions */}
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 rounded-lg flex items-center gap-4">
                                            {agent.photo_url ? (
                                                <img src={`/storage/${agent.photo_url}`} className="h-16 w-16 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center text-lg text-white font-semibold">
                                                    {agent.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-medium text-gray-900">{agent.name}</h4>
                                                <p className="text-xs text-gray-600">{agent.contact_number}</p>
                                            </div>
                                        </div>

                                        {deal.status === 'Pending' ? (
                                            <div className="space-y-2">
                                                {isOwnerUpdate ? (
                                                    <motion.button whileTap={{ scale: 0.95 }}
                                                                   onClick={() => openModal(deal)}
                                                                   className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                                        Edit Offer
                                                    </motion.button>
                                                ) : (
                                                    <motion.button whileTap={{ scale: 0.95 }}
                                                                   onClick={() => {
                                                                       setSelectedDeal(deal);
                                                                       setSelectedStatus("Accepted");
                                                                       setOpenAcceptModal(true);
                                                                   }}
                                                                   className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                                        Accept Offer
                                                    </motion.button>
                                                )}
                                                <motion.button whileTap={{ scale: 0.95 }}
                                                               onClick={() => {
                                                                   setSelectedDeal(deal);
                                                                   setSelectedStatus("Cancelled");
                                                                   setOpenAcceptModal(true);
                                                               }}
                                                               className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200">
                                                    Decline Offer
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <span className={`inline-block px-3 py-1 text-sm rounded-full ${statusClass}`}>
                                                {deal.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 mt-10">No deals yet.</p>
                )}
            </div>
        </BuyerLayout>
    );
}
