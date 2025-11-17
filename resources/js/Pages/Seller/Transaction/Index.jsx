import { Link } from "@inertiajs/react";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faStar, faCalendar, faTag, faUser, faHome, faMoneyBill, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import FeedbackForm from "@/Components/modal/Buyer/FeedbackForm.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

export default function Index({ transactions }) {
    const [openFeedback, setOpenFeedBack] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-white pt-12  mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
                    <p className="text-gray-600">Manage and review your property transactions</p>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary">Total Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{transactions?.total || 0}</p>
                                </div>
                                <FontAwesomeIcon icon={faTag} className="text-primary text-xl" />
                            </div>
                        </div>
                        <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary">Sold Properties</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {transactions?.data?.filter(txn => txn.status === 'SOLD').length || 0}
                                    </p>
                                </div>
                                <FontAwesomeIcon icon={faHome} className="text-secondary text-xl" />
                            </div>
                        </div>
                        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-accent">Total Value</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        ₱{transactions?.data?.reduce((sum, txn) => sum + parseFloat(txn.tcp), 0).toLocaleString() || 0}
                                    </p>
                                </div>
                                <FontAwesomeIcon icon={faMoneyBill} className="text-accent text-xl" />
                            </div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary">Pending Feedback</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {transactions?.data?.filter(txn => !txn.feedback).length || 0}
                                    </p>
                                </div>
                                <FontAwesomeIcon icon={faMessage} className="text-primary text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Modal */}
                <FeedbackForm
                    openFeedback={openFeedback}
                    setOpenFeedBack={setOpenFeedBack}
                    agentId={selectedAgentId}
                    transactionId={selectedTransactionId}
                />

                {/* No Transactions Message */}
                {transactions?.data?.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faTag} className="text-gray-400 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
                            <p className="text-gray-500 mb-6">Your property transactions will appear here once deals are made.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {transactions.data.map((txn) => (
                            <div
                                key={txn.id}
                                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Property & Transaction Info */}
                                    <div className="flex gap-4 flex-1">
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-accent to-primary rounded-xl border border-gray-200 flex items-center justify-center">
                                                <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between py-1 flex-1">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                                                        {txn?.property?.title ?? "Untitled Property"}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        txn.status === 'SOLD'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {txn.status}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 mb-3">{txn?.property?.address}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FontAwesomeIcon icon={faMoneyBill} className="text-gray-400" />
                                                            <span>Base Price: <strong>₱{parseFloat(txn.base_price).toLocaleString()}</strong></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FontAwesomeIcon icon={faCreditCard} className="text-gray-400" />
                                                            <span>TCP: <strong className="text-green-600">₱{parseFloat(txn.tcp).toLocaleString()}</strong></span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                                            <span>Financing: <strong className="capitalize">{txn.financing}</strong></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                                                            <span>Closed: {dayjs(txn.closed_at).format("MMM D, YYYY")}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vertical Separator */}
                                    <div className="hidden lg:block w-px bg-gray-200 mx-2"></div>

                                    {/* Agent Info + Buyer Info + Feedback */}
                                    <div className="flex flex-col justify-between gap-6 lg:w-96">
                                        {/* Agent Section */}
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Primary Agent</h4>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    {txn?.agent?.photo_url ? (
                                                        <img
                                                            src={`/storage/${txn.agent.photo_url}`}
                                                            alt={txn.agent.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent to-primary text-white font-semibold rounded-full uppercase text-sm">
                                                            {txn?.agent?.name?.charAt(0) ?? "A"}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {txn?.agent?.name ?? "Unknown Agent"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {txn?.agent?.email ?? "N/A"}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                                                            <span className="text-xs text-gray-600">{txn.agent.rating || "No rating"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Buyer Section */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Buyer</h4>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-secondary to-primary text-white font-semibold rounded-full uppercase text-sm">
                                                        {txn?.buyer?.name?.charAt(0) ?? "B"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {txn?.buyer?.name ?? "Unknown Buyer"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {txn?.buyer?.email ?? "N/A"}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {txn?.buyer?.contact_number ?? "No contact"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feedback Button */}
                                        <div className="flex justify-end">
                                            {!txn?.feedback ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAgentId(txn.primary_agent_id);
                                                        setSelectedTransactionId(txn.id);
                                                        setOpenFeedBack(true);
                                                    }}
                                                    className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-accent to-primary text-white rounded-xl hover:from-accent/90 hover:to-primary/90 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                                >
                                                    <FontAwesomeIcon icon={faMessage} className="text-sm" />
                                                    Rate Agent
                                                </button>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
                                                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                                                    Feedback Submitted
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {transactions?.links && transactions.links.length > 3 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex items-center gap-2">
                            {transactions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                        link.active
                                            ? 'bg-primary border-primary text-white shadow-sm'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
