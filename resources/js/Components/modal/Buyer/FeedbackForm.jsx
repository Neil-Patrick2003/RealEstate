import React, {useEffect} from "react";
import { useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faXmark,
    faUserCheck,
    faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

const characteristicsOptions = [
    "Friendly",
    "Patient",
    "Detail-oriented",
    "Proactive",
    "Helpful",
    "Local expert",
    "Reliable",
    "Good listener",
];

const ratingDescriptions = {
    communication: "Did the agent explain things clearly?",
    negotiation: "Was the agent fair and effective in reaching a deal?",
    professionalism: "Did the agent act in a trustworthy and respectful manner?",
    knowledge: "Did the agent provide helpful follow-up or after-sale support?"
};


export default function FeedbackForm({ openFeedback, setOpenFeedBack, agentId, transactionId }) {
    const ratingFields = [
        { name: "communication", label: "Communication Skills" },
        { name: "negotiation", label: "Negotiation skills" },
        { name: "professionalism", label: "Trustworthiness" },
        { name: "knowledge", label: "Follow-up / After-sale support" },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        transaction_id: transactionId || null,
        agent_id: agentId || null,
        ratings: {
            communication: 0,
            negotiation: 0,
            professionalism: 0,
            knowledge: 0,
        },
        characteristics: [],
        comments: "",
    });

    const toggleCharacteristic = (char) => {
        setData("characteristics", data.characteristics.includes(char)
            ? data.characteristics.filter((c) => c !== char)
            : [...data.characteristics, char]
        );
    };

    const handleRating = (field, value) => {
        setData("ratings", { ...data.ratings, [field]: value });
    };


    useEffect(() => {
        setData((prev) => ({
            ...prev,
            transaction_id: transactionId,
            agent_id: agentId,
        }));
    }, [transactionId, agentId]);

    const submitFeedback = (e) => {
        console.log(agentId);
        e.preventDefault();
        post("/feedback", {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpenFeedBack(false);
            },
        });
    };

    if (!openFeedback) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-3xl bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
                {/* Header */}
                <header className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4 z-10 rounded-t-3xl">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FontAwesomeIcon icon={faUserCheck} className="text-primary" />
                        Agent Feedback
                    </h2>
                    <button
                        onClick={() => setOpenFeedBack(false)}
                        className="text-gray-400 hover:text-gray-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        type="button"
                        aria-label="Close feedback modal"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-2xl" />
                    </button>
                </header>

                {/* Form */}
                <form onSubmit={submitFeedback} className="px-6 py-6 overflow-y-auto space-y-10 flex-grow">
                    {/* Ratings Section */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                            Rate Your Agent
                        </h3>
                        <div className="space-y-6">
                            {ratingFields.map(({ name, label }) => (
                                <div key={name}>
                                    <label htmlFor={`rating-${name}`} className="block text-gray-800 font-medium text-sm mb-1">
                                        {label}
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2 italic">
                                        {ratingDescriptions[name]}
                                    </p>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                id={`rating-${name}-${star}`}
                                                type="button"
                                                aria-label={`${label}: ${star} star${star > 1 ? "s" : ""}`}
                                                onClick={() => handleRating(name, star)}
                                                className={`text-2xl transition-colors ${
                                                    data.ratings[name] >= star
                                                        ? "text-yellow-400"
                                                        : "text-gray-300 hover:text-yellow-300"
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faStar} />
                                            </button>
                                        ))}
                                    </div>
                                    {errors[`ratings.${name}`] && (
                                        <p className="text-red-600 text-xs mt-1">{errors[`ratings.${name}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Characteristics */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCommentDots} className="text-primary" />
                            Agent Characteristics
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">Choose words that describe your agent.</p>
                        <div className="flex flex-wrap gap-3">
                            {characteristicsOptions.map((char) => {
                                const selected = data.characteristics.includes(char);
                                return (
                                    <button
                                        key={char}
                                        type="button"
                                        id={`char-${char}`}
                                        onClick={() => toggleCharacteristic(char)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                                            selected
                                                ? "bg-primary text-white border-primary shadow"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        {char}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.characteristics && (
                            <p className="text-red-600 text-xs mt-2">{errors.characteristics}</p>
                        )}
                    </section>

                    {/* Comment Box */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <label
                            htmlFor="comments"
                            className="block font-semibold mb-2 text-gray-800 text-sm"
                        >
                            More Comments (optional)
                        </label>
                        <textarea
                            id="comments"
                            rows={4}
                            placeholder="Write any additional thoughts..."
                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-y"
                            value={data.comments}
                            onChange={(e) => setData("comments", e.target.value)}
                        />
                        {errors.comments && (
                            <p className="text-red-600 text-xs mt-1">{errors.comments}</p>
                        )}
                    </section>

                    {/* Submit & Cancel */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setOpenFeedBack(false);
                            }}
                            className="px-6 py-2 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 rounded-2xl bg-primary text-white hover:bg-accent text-sm font-semibold"
                        >
                            {processing ? "Sending..." : "Submit Feedback"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
