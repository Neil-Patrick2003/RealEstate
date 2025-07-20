import React from "react";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import AgentLayout from "@/Layouts/AgentLayout.jsx";

export default function Feedback({ feedbacks }) {
    console.log(feedbacks);
    return (
        <AgentLayout>
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Agent Feedback</h2>

            {feedbacks.length === 0 ? (
                <div className="text-center text-gray-500 bg-white py-12 rounded-md shadow-sm text-lg">
                    No feedback has been submitted for this agent yet.
                </div>
            ) : (
                <ul className="space-y-8">
                    {feedbacks.map((fb) => (
                        <li
                            key={fb.id}
                            className="bg-white p-6 rounded-xl shadow  transition hover:shadow-lg"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-full text-lg font-bold uppercase">
                                    {fb.sender?.name?.charAt(0) ?? "U"}
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-slate-800">
                                        {fb.sender?.name || "Anonymous"}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {dayjs(fb.created_at).format("MMMM D, YYYY")}
                                    </p>
                                </div>
                            </div>

                            {/* Ratings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-base text-slate-700 mb-6">
                                {[
                                    ["Communication", fb.communication],
                                    ["Negotiation", fb.negotiation],
                                    ["Professionalism", fb.professionalism],
                                    ["Knowledge", fb.knowledge],
                                ].map(([label, value], index) => (
                                    <div key={index}>
                                        <strong className="block text-sm text-gray-600 mb-1">{label}</strong>
                                        <StarRating value={value} />
                                    </div>
                                ))}
                            </div>

                            {/* Characteristics */}
                            {fb.characteristics?.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {fb.characteristics.map((char) => (
                                        <span
                                            key={char.id}
                                            className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium"
                                        >
                                            {char.characteristic}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Comment */}
                            {fb.comments && (
                                <div className="mt-4 flex items-start gap-2 text-base text-gray-700">
                                    <FontAwesomeIcon icon={faCommentDots} className="text-gray-400 mt-1" />
                                    <p className="italic">{fb.comments}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </AgentLayout>
    );
}

// Star rating component
const StarRating = ({ value }) => {
    return (
        <div className="flex items-center gap-1 text-lg">
            {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={i < value ? "text-yellow-400" : "text-gray-300"}
                />
            ))}
        </div>
    );
};
