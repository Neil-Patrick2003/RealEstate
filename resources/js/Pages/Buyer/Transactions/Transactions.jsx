import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import FeedbackForm from "@/Components/modal/Buyer/FeedbackForm.jsx";

export default function Transactions({ transactions, auth }) {
    const [openFeedback, setOpenFeedBack] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    const hasFeedbackForAgent = (txn, agentId) => {
        return txn.feedback?.some(fb => fb.agent_id === agentId && fb.sender_id === auth.user.id);
    };

    return (
        <BuyerLayout>
            <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center sm:text-left">
                    My Closed Transactions
                </h2>

                {/* Feedback Modal */}
                <FeedbackForm
                    openFeedback={openFeedback}
                    setOpenFeedBack={setOpenFeedBack}
                    agentId={selectedAgentId}
                    transactionId={selectedTransactionId}
                />

                {transactions?.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg shadow-md text-gray-600 text-center border border-gray-200">
                        You have no closed transactions yet.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {transactions.map((txn) => {
                            const property = txn?.property_listing?.property;
                            const agents = txn?.property_listing?.agents ?? [];

                            return (
                                <div
                                    key={txn.id}
                                    className="bg-white border-l-8 border-primary p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row justify-between gap-6"
                                >
                                    {/* Property Info */}
                                    <div className="flex gap-6 w-full md:w-2/3">
                                        <img
                                            src={`/storage/${property?.image_url}`}
                                            onError={(e) => (e.target.src = "/placeholder.png")}
                                            alt={property?.title || "Property"}
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div className="flex flex-col justify-between space-y-3">
                                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                                                {property?.title ?? "Untitled Property"}
                                            </h3>
                                            <p className="text-sm text-gray-500 tracking-wide">
                                                {property?.property_type} — {property?.sub_type}
                                            </p>
                                            <p className="text-lg text-primary font-semibold tracking-wide">
                                                ₱{txn?.amount?.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 tracking-wide">
                                                Closed on {dayjs(txn.created_at).format("MMMM D, YYYY")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Agents Info */}
                                    <div className="flex flex-col gap-6 w-full md:w-auto md:min-w-[300px]">
                                        {agents.map((agent) => {
                                            const feedbackGiven = hasFeedbackForAgent(txn, agent.id);

                                            return (
                                                <div
                                                    key={agent.id}
                                                    className="flex flex-col items-start md:items-end gap-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {agent?.avatar_url ? (
                                                            <img
                                                                src={agent.avatar_url}
                                                                alt={agent.name}
                                                                className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 flex items-center justify-center bg-primary text-white font-semibold rounded-full uppercase text-lg select-none">
                                                                {agent?.name?.charAt(0) ?? "A"}
                                                            </div>
                                                        )}

                                                        <div className="text-sm leading-tight text-right">
                                                            <p className="text-gray-900 font-semibold tracking-wide">
                                                                {agent?.name ?? "Unknown"}
                                                            </p>
                                                            <p className="text-gray-500 text-xs tracking-wide">
                                                                {agent?.email ?? "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedAgentId(agent.id);
                                                            setSelectedTransactionId(txn.id);
                                                            setOpenFeedBack(true);
                                                        }}
                                                        disabled={feedbackGiven}
                                                        className={`
                                                            inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium
                                                            transition
                                                            ${
                                                            feedbackGiven
                                                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                                : "bg-primary text-white hover:bg-accent"
                                                        }
                                                        `}
                                                        title={
                                                            feedbackGiven
                                                                ? "Feedback already submitted"
                                                                : "Give Feedback"
                                                        }
                                                        aria-disabled={feedbackGiven}
                                                    >
                                                        <FontAwesomeIcon icon={faMessage} />
                                                        {feedbackGiven ? "Feedback Submitted" : "Give Feedback"}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}
