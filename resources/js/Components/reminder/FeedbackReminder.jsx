import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

const LS_KEY_SNOOZE = "fb_reminder_snooze_until";
const LS_KEY_DISMISSED_IDS = "fb_reminder_dismissed_ids";

// Helpers for localStorage
const safeGet = (k, def) => {
    try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch { return def; }
};
const safeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export default function FeedbackReminder({ items = [] }) {
    const [open, setOpen] = useState(false);
    const [queue, setQueue] = useState([]);

    // Filter out deals the user dismissed and honor snooze
    useEffect(() => {
        const snoozeUntil = safeGet(LS_KEY_SNOOZE, null);
        if (snoozeUntil && Date.now() < Number(snoozeUntil)) return; // snoozed

        const dismissed = new Set(safeGet(LS_KEY_DISMISSED_IDS, []));
        const pending = items.filter(d => !dismissed.has(d.id));
        if (pending.length) {
            setQueue(pending);
            setOpen(true);
        }
    }, [items]);

    const current = useMemo(() => queue[0] || null, [queue]);

    const dismissOne = (id) => {
        const next = queue.slice(1);
        setQueue(next);
        if (next.length === 0) setOpen(false);
        const dismissed = safeGet(LS_KEY_DISMISSED_IDS, []);
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            safeSet(LS_KEY_DISMISSED_IDS, dismissed);
        }
    };

    const snooze = (days = 7) => {
        const until = Date.now() + days * 24 * 60 * 60 * 1000;
        safeSet(LS_KEY_SNOOZE, until);
        setOpen(false);
    };

    if (!open || !current) return null;

    const { id, property, agent, feedback_link } = current;

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center">
            <button
                className="absolute inset-0 bg-black/30"
                aria-label="Close"
                onClick={() => snooze(1)}
            />
            <div className="relative z-[1201] w-[92vw] max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Rate your experience</h3>
                <p className="mt-1 text-sm text-gray-600">
                    You have a closed deal{agent?.name ? ` with ${agent.name}` : ""}. Please leave feedback to help other buyers.
                </p>

                <div className="mt-4 flex items-center gap-3">
                    <div className="w-12 h-12 overflow-hidden rounded-full ring-1 ring-gray-200 bg-gray-50">
                        {agent?.photo_url ? (
                            <img src={`/storage/${agent.photo_url}`} alt={agent?.name || "Agent"} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                                {(agent?.name || "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{agent?.name || "Agent"}</p>
                        <p className="text-xs text-gray-500 truncate">{property?.title || "Property"}</p>
                    </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                    <Link
                        href='/transaction'
                        className="w-full inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-accent"
                        onClick={() => dismissOne(id)}
                    >
                        Leave Feedback
                    </Link>
                    <button
                        className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                        onClick={() => snooze(7)}
                        title="Remind me in 7 days"
                    >
                        Remind me later
                    </button>
                    <button
                        className="w-full rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        onClick={() => dismissOne(id)}
                    >
                        Dismiss
                    </button>
                </div>

                {/* queue indicator */}
                {queue.length > 1 && (
                    <p className="mt-3 text-[11px] text-gray-500">
                        {queue.length - 1} more feedback request{queue.length - 1 === 1 ? "" : "s"} queued
                    </p>
                )}
            </div>
        </div>
    );
}
