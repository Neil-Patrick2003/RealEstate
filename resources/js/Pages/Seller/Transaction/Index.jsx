import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { Link } from "@inertiajs/react";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import FeedbackForm from "@/Components/modal/Buyer/FeedbackForm.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

export default function Index({ transactions }) {
    const [openFeedback, setOpenFeedBack] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    return (
        <AuthenticatedLayout>
            <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">My Closed Transactions</h2>

                {/* Feedback Modal */}
                <FeedbackForm
                    openFeedback={openFeedback}
                    setOpenFeedBack={setOpenFeedBack}
                    agentId={selectedAgentId}
                    transactionId={selectedTransactionId}
                />

                {/* No Transactions Message */}
                {transactions?.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-gray-500 text-center border border-gray-100">
                        You have no closed transactions yet.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {transactions.map((txn) => (
                            <div
                                key={txn.id}
                                className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                            >
                                {/* Property Info */}
                                <div className="flex gap-4 w-full md:w-2/3">
                                    <img
                                        src={`/storage/${txn?.property_listing?.property?.image_url}`}
                                        onError={(e) => (e.target.src = "/placeholder.png")}
                                        alt={txn?.property_listing?.property?.title || "Property"}
                                        className="w-28 h-28 object-cover rounded-md border border-gray-200"
                                    />
                                    <div className="flex flex-col justify-between space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                            {txn?.property_listing?.property?.title ?? "Untitled Property"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {txn?.property_listing?.property?.property_type} &mdash; {txn?.property_listing?.property?.sub_type}
                                        </p>
                                        <p className="text-primary font-semibold text-base">
                                            ₱{txn?.amount?.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {dayjs(txn.created_at).format("MMMM D, YYYY")}
                                        </p>
                                    </div>
                                </div>

                                {/* Agent Info + Feedback */}
                                <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-3">
                                        {/* Agent Avatar or Initial */}
                                        {txn?.property_listing?.agent?.image_url ? (
                                            <img
                                                src={`/storage/${txn.property_listing.agent.image_url}`}
                                                alt={txn.property_listing.agent.name}
                                                className="w-10 h-10 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 flex items-center justify-center bg-primary text-white font-semibold rounded-full uppercase">
                                                {txn?.property_listing?.agent?.name?.charAt(0) ?? "A"}
                                            </div>
                                        )}

                                        <div className="text-sm leading-tight">
                                            <p className="text-gray-800 font-medium">
                                                {txn?.property_listing?.agent?.name ?? "Unknown"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {txn?.property_listing?.agent?.email ?? "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Feedback Button */}
                                    {!txn?.feedback && (
                                        <button
                                            onClick={() => {
                                                setSelectedAgentId(txn.property_listing.agent.id);
                                                setSelectedTransactionId(txn.id);
                                                setOpenFeedBack(true);
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-accent transition"
                                        >
                                            <FontAwesomeIcon icon={faMessage} />
                                            Give Feedback
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
