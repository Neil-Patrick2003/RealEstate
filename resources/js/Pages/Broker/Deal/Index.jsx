import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import StatCard from "@/Components/StatCard.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import CounterOfferModal from "@/Components/Deal/CounterOfferModal.jsx";

export default function Index({
                                  property_listings,
                                  all_deals_count,
                                  pending_deals_count,
                                  cancelled_deals_count,
                                  closed_deals_count,
                              }) {
    const { data, setData, patch, processing, reset } = useForm({
        id: "",
        status: "",
    });

    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [openCounterModal, setOpenCounterModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    const userId = usePage().props.auth.user.id;

    const handleStatusUpdate = (deal, status) => {
        setSelectedDeal(deal);
        setData({ id: deal.id, status });
        setOpenStatusModal(true);
    };

    const handleCounter = (deal, property) => {
        setSelectedDeal({ deal, property });
        setOpenCounterModal(true);
    };

    const submitStatusUpdate = () => {
        patch(route("broker.deals.update", { deal: data.id, status: data.status }), {
            onSuccess: () => {
                setOpenStatusModal(false);
                reset();
            },
        });
    };

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        accepted: "bg-green-100 text-green-700",
        declined: "bg-red-100 text-red-700",
        upcoming: "bg-blue-100 text-blue-700",
        cancelled: "bg-gray-100 text-gray-500",
        closed: "bg-indigo-100 text-indigo-700",
        sold: "bg-purple-100 text-purple-700",
    };

    // Filter deals to show only Pending and Accepted
    const filteredDeals = (listing) =>
        listing.deal?.filter((deal) => ["Pending", "Accepted"].includes(deal.status)) || [];

    // Check if there are any deals at all
    const hasDeals = property_listings?.data?.some(
        (listing) => filteredDeals(listing).length > 0
    );

    return (
        <BrokerLayout>
            {/* Confirm Modal */}
            <ConfirmDialog
                open={openStatusModal}
                onConfirm={submitStatusUpdate}
                confirmText="Yes, Confirm"
                cancelText="Cancel"
                setOpen={setOpenStatusModal}
                title="Update Deal Status"
                description={`Are you sure you want to mark this deal as "${data.status}"?`}
                processing={processing}
            />

            <CounterOfferModal
                show={openCounterModal}
                onClose={() => setOpenCounterModal(false)}
                deal={selectedDeal?.deal}
                property={selectedDeal?.property}
                buyer={selectedDeal?.deal?.buyer}
            />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold text-gray-800 mb-4">Active Deals</h1>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="All Deals"
                        count={all_deals_count}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600" />}
                        bgColor="bg-gray-100"
                    />
                    <StatCard
                        title="Pending Offers"
                        count={pending_deals_count}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-600" />}
                        bgColor="bg-yellow-100"
                    />
                    <StatCard
                        title="Closed Deals"
                        count={closed_deals_count}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />}
                        bgColor="bg-blue-100"
                    />
                    <StatCard
                        title="Cancelled Deals"
                        count={cancelled_deals_count}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-red-600" />}
                        bgColor="bg-red-100"
                    />
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-md">
                    {hasDeals ? (
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-500 tracking-wide sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-left">Property</th>
                                <th className="p-4 text-left">Buyer</th>
                                <th className="p-4 text-right">Offer</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {property_listings.data.map(
                                (listing) =>
                                    filteredDeals(listing).length > 0 &&
                                    filteredDeals(listing).map((deal) => (
                                        <tr key={deal.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 align-top">
                                                <div className="flex gap-3 items-start">
                                                    <img
                                                        src={
                                                            listing?.property?.image_url
                                                                ? `/storage/${listing.property.image_url}`
                                                                : "/placeholder-image.jpg"
                                                        }
                                                        alt={listing?.property?.title || "No Title"}
                                                        className="w-14 h-14 object-cover rounded-md"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{listing?.property?.title || "-"}</p>
                                                        <p className="text-sm text-gray-500">{listing?.property?.address || "-"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="font-medium text-gray-800">{deal?.buyer?.name || "-"}</p>
                                                <p className="text-sm text-gray-500">{deal?.buyer?.email || "-"}</p>
                                            </td>
                                            <td className="p-4 align-top text-right">
                                                <p className="font-semibold text-gray-900">
                                                    ₱
                                                    {Number(deal?.amount || 0).toLocaleString("en-PH", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Offered on {dayjs(deal?.created_at).format("MMM D, YYYY")}
                                                </p>
                                            </td>
                                            <td className="p-4 align-top">
                                              <span
                                                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                      statusColors[deal?.status?.toLowerCase()] || "bg-gray-100 text-gray-600"
                                                  }`}
                                              >
                                                {deal?.status || "Unknown"}
                                              </span>
                                            </td>
                                            <td className="p-4 align-top text-right flex gap-2 justify-end">
                                                {deal?.status === "Pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(deal, "Accepted")}
                                                            disabled={processing || deal?.amount_last_updated_by === userId}
                                                            className="text-sm px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleCounter(deal, listing.property)}
                                                            className="text-sm px-3 py-1.5 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                                                        >
                                                            {deal?.amount_last_updated_by === userId ? "Edit" : "Counter"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(deal, "Declined")}
                                                            disabled={processing || deal?.amount_last_updated_by === userId}
                                                            className="text-sm px-3 py-1.5 rounded-md text-red-600 border border-red-300 hover:bg-red-50 transition disabled:opacity-50"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                )}
                                                {deal?.status === "Accepted" && (
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(deal, "Sold")}
                                                            className="text-sm px-3 py-1.5 rounded-md text-white bg-orange-500 hover:bg-orange-600 transition"
                                                        >
                                                            Mark as Sold
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(deal, "Cancelled")}
                                                            className="text-sm px-3 py-1.5 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6 text-center text-gray-500">No deals at the moment.</div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-4">
                    {hasDeals ? (
                        property_listings.data.map(
                            (listing) =>
                                filteredDeals(listing).length > 0 &&
                                filteredDeals(listing).map((deal) => (
                                    <div key={deal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                        {/* Property */}
                                        <div className="flex gap-3 items-start mb-3">
                                            <img
                                                src={
                                                    listing?.property?.image_url
                                                        ? `/storage/${listing.property.image_url}`
                                                        : "/placeholder-image.jpg"
                                                }
                                                alt={listing?.property?.title || "No Title"}
                                                className="w-16 h-16 object-cover rounded-md"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">{listing?.property?.title || "-"}</p>
                                                <p className="text-sm text-gray-500">{listing?.property?.address || "-"}</p>
                                            </div>
                                        </div>

                                        {/* Buyer + Offer */}
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Buyer</p>
                                                <p className="font-medium text-gray-800">{deal?.buyer?.name || "-"}</p>
                                                <p className="text-xs text-gray-500">{deal?.buyer?.email || "-"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Offer</p>
                                                <p className="font-semibold text-gray-900">
                                                    ₱
                                                    {Number(deal?.amount || 0).toLocaleString("en-PH", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {dayjs(deal?.created_at).format("MMM D, YYYY")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center justify-between mb-3">
                                              <span
                                                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                      statusColors[deal?.status?.toLowerCase()] || "bg-gray-100 text-gray-600"
                                                  }`}
                                              >
                                                {deal?.status || "Unknown"}
                                              </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            {deal?.status === "Pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(deal, "Accepted")}
                                                        disabled={processing || deal?.amount_last_updated_by === userId}
                                                        className="flex-1 text-sm px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleCounter(deal, listing.property)}
                                                        className="flex-1 text-sm px-3 py-2 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                                                    >
                                                        {deal?.amount_last_updated_by === userId ? "Edit" : "Counter"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(deal, "Declined")}
                                                        disabled={processing || deal?.amount_last_updated_by === userId}
                                                        className="flex-1 text-sm px-3 py-2 rounded-md text-red-600 border border-red-300 hover:bg-red-50 transition disabled:opacity-50"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {deal?.status === "Accepted" && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(deal, "Sold")}
                                                        className="flex-1 text-sm px-3 py-2 rounded-md text-white bg-orange-500 hover:bg-orange-600 transition"
                                                    >
                                                        Mark as Sold
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(deal, "Cancelled")}
                                                        className="flex-1 text-sm px-3 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )
                    ) : (
                        <p className="text-center text-gray-500">No deals at the moment.</p>
                    )}

                </div>

            </div>
        </BrokerLayout>
    );
}
