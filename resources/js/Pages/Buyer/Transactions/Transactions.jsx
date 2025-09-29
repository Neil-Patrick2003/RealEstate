import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faFolderOpen, faHome } from "@fortawesome/free-solid-svg-icons";
import FeedbackForm from "@/Components/modal/Buyer/FeedbackForm.jsx";

/* ---------- helpers ---------- */
const arr = (v) => (Array.isArray(v) ? v : []);
const firstLetter = (name) =>
    typeof name === "string" && name.length > 0 ? name.charAt(0).toUpperCase() : "A";
const peso = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
};

// Prefer agents; if none, fallback to broker(s)
const pickParticipants = (listing) => {
    const agents = arr(listing?.agents).map((a) => ({ ...a, _role: "Agent" }));

    // Support both a single broker object or brokers array
    const brokersRaw = listing?.broker ? [listing.broker] : arr(listing?.brokers);
    const brokers = brokersRaw.map((b) => ({ ...b, _role: "Broker" }));

    if (agents.length > 0) return agents;
    return brokers;
};

export default function Transactions({ transactions = [], auth = {} }) {
    const [openFeedback, setOpenFeedBack] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    const hasFeedbackForAgent = (txn, agentId) => {
        const myId = auth?.user?.id;
        return arr(txn?.feedback).some((fb) => fb?.agent_id === agentId && fb?.sender_id === myId);
    };

    const handleOpenFeedback = (agentId, txnId) => {
        setSelectedAgentId(agentId ?? null);
        setSelectedTransactionId(txnId ?? null);
        setOpenFeedBack(true);
    };

    const hasNoTxns = transactions.length === 0;

    return (
        <BuyerLayout>
            <div className="pt-10 mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <FontAwesomeIcon icon={faHome} />
            </span>
                        My Closed Transactions
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {hasNoTxns ? "When you close a deal, it will appear here." : `${transactions.length} closed transaction(s)`}
                    </p>
                </header>

                {/* Feedback Modal */}
                <FeedbackForm
                    openFeedback={openFeedback}
                    setOpenFeedBack={setOpenFeedBack}
                    agentId={selectedAgentId}           // passing broker id here also works as 'agentId' for the form
                    transactionId={selectedTransactionId}
                />

                {/* Empty state */}
                {hasNoTxns ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <FontAwesomeIcon icon={faFolderOpen} className="text-gray-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">No closed transactions yet</h2>
                        <p className="mt-2 text-gray-600">Once a property is marked closed, details and feedback options will show here.</p>
                    </div>
                ) : (
                    <section className="space-y-6">
                        {arr(transactions).map((txn) => {
                            const listing = txn?.property_listing ?? {};
                            const property = listing?.property ?? {};
                            const participants = pickParticipants(listing); // <-- agents or (fallback) brokers
                            const imageSrc = property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png";
                            const closedOn = txn?.created_at ? dayjs(txn.created_at).format("MMMM D, YYYY") : "—";

                            return (
                                <article
                                    key={txn?.id ?? Math.random()}
                                    className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-5 md:flex-row md:items-stretch">
                                        {/* Property */}
                                        <div className="flex w-full gap-4 md:w-2/3">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={imageSrc}
                                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                    alt={property?.title || "Property cover"}
                                                    className="h-28 w-28 rounded-xl border border-gray-200 object-cover"
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                <div>
                                                    <h3 className="truncate text-lg font-semibold text-gray-900">
                                                        {property?.title ?? "Untitled Property"}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {(property?.property_type || "—")} <span className="text-gray-400">•</span>{" "}
                                                        {(property?.sub_type || "—")}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                            {peso(txn?.amount)}
                          </span>
                                                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
                            Closed on {closedOn}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Participants (Agents if present, else Brokers) */}
                                        <div className="w-full md:w-1/3">
                                            {participants.length === 0 ? (
                                                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/50 p-4 text-sm text-gray-500">
                                                    No agents/brokers linked
                                                </div>
                                            ) : (
                                                <ul className="grid gap-3">
                                                    {participants.map((p) => {
                                                        const feedbackGiven = hasFeedbackForAgent(txn, p?.id);
                                                        const avatar = p?.avatar_url || p?.photo_url; // support both keys
                                                        return (
                                                            <li
                                                                key={`${p?._role || "P"}-${p?.id ?? Math.random()}`}
                                                                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    {avatar ? (
                                                                        <img
                                                                            src={avatar}
                                                                            alt={p?.name || p?._role || "Participant"}
                                                                            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                                                                            onError={(e) => (e.currentTarget.style.display = "none")}
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
                                                                            {firstLetter(p?.name)}
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-medium text-gray-900">
                                                                            {p?.name ?? "Unknown"}
                                                                            {p?._role ? (
                                                                                <span className="ml-2 rounded-full bg-gray-100 px-2 py-[2px] text-[10px] font-medium text-gray-600">
                                          {p._role}
                                        </span>
                                                                            ) : null}
                                                                        </p>
                                                                        <p className="truncate text-xs text-gray-500">{p?.email ?? "N/A"}</p>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenFeedback(p?.id, txn?.id)}
                                                                    disabled={feedbackGiven}
                                                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                                        feedbackGiven
                                                                            ? "cursor-not-allowed bg-gray-200 text-gray-600"
                                                                            : "bg-primary text-white hover:bg-accent"
                                                                    }`}
                                                                    title={feedbackGiven ? "Feedback already submitted" : "Give Feedback"}
                                                                    aria-disabled={feedbackGiven}
                                                                >
                                                                    <FontAwesomeIcon icon={faMessage} />
                                                                    {feedbackGiven ? "Submitted" : "Give Feedback"}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>
        </BuyerLayout>
    );
}
