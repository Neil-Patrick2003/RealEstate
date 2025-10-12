import React from "react";
import dayjs from "dayjs";

export default function RecentFeedbacks({ feedbacks }) {
    return (
        <ul role="list" className="divide-y divide-gray-100">
            {feedbacks.map((feedback) => (
                <li key={feedback.id} className="flex gap-x-4 py-5">
                    {/* Avatar or Fallback Initial */}
                    {feedback.sender?.image_url ? (
                        <img
                            alt={feedback.sender.name}
                            src={`/storage/${feedback.sender.image_url}`}
                            className="size-12 flex-none rounded-full object-cover border bg-gray-50"
                        />
                    ) : (
                        <div className="size-12 flex-none rounded-full bg-primary text-white flex items-center justify-center font-semibold uppercase">
                            {feedback.sender?.name?.charAt(0) ?? "U"}
                        </div>
                    )}

                    {/* Feedback Content */}
                    <div className="flex-auto">
                        <div className="flex items-baseline justify-between gap-x-4">
                            <p className="text-sm font-semibold text-gray-900">
                                {feedback.sender?.name ?? "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-600">
                                <time dateTime={feedback.created_at}>
                                    {dayjs(feedback.created_at).format("MMM D, YYYY")}
                                </time>
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{feedback.comments}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
