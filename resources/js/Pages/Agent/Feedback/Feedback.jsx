// resources/js/Pages/Agents/Feedback.jsx
import React, { useMemo, useState, useEffect } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faCommentDots,
    faFilter,
    faMagnifyingGlass,
    faArrowDownWideShort,
} from "@fortawesome/free-solid-svg-icons";

/* ---------- small utils ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const clamp5 = (n) => Math.max(0, Math.min(5, Math.round(n)));

/* ---------- Star components ---------- */
const StarRow = ({ value, size = "text-lg" }) => (
    <div className={cn("flex items-center gap-1", size)}>
        {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={i < value ? "text-yellow-400" : "text-gray-300"}
            />
        ))}
    </div>
);

const RatingBadge = ({ value }) => (
    <div className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1 text-xs font-semibold">
        <FontAwesomeIcon icon={faStar} />
        {value.toFixed(1)}
    </div>
);

const Bar = ({ label, value, color = "bg-primary" }) => (
    <div>
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{label}</span>
            <span className="font-medium">{value.toFixed(1)}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
                className={cn("h-2 rounded-full transition-all", color)}
                style={{ width: `${(value / 5) * 100}%` }}
            />
        </div>
    </div>
);

/* ---------- Card ---------- */
const FeedbackCard = ({ fb }) => {
    const name = fb?.sender?.name || "Anonymous";
    const initial = name?.charAt(0)?.toUpperCase() || "U";
    const when = dayjs(fb.created_at).format("MMMM D, YYYY");

    return (
        <li className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary text-white flex items-center justify-center rounded-full text-lg font-bold uppercase">
                    {initial}
                </div>
                <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-sm text-gray-500">{when}</p>
                </div>
            </div>

            {/* Ratings grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 mb-6">
                {[
                    ["Communication", fb.communication],
                    ["Negotiation", fb.negotiation],
                    ["Professionalism", fb.professionalism],
                    ["Knowledge", fb.knowledge],
                ].map(([label, value], i) => (
                    <div key={i} className="rounded-lg border border-gray-100 p-3">
                        <div className="text-xs text-gray-500 mb-1">{label}</div>
                        <div className="flex items-center gap-2">
                            <StarRow value={clamp5(Number(value || 0))} />
                            <RatingBadge value={Number(value || 0)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Characteristics */}
            {Array.isArray(fb.characteristics) && fb.characteristics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {fb.characteristics.map((c) => (
                        <span
                            key={c.id ?? c.characteristic}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full"
                        >
              {c.characteristic}
            </span>
                    ))}
                </div>
            )}

            {/* Comment */}
            {fb.comments && (
                <div className="mt-2 flex items-start gap-2 text-base text-gray-700">
                    <FontAwesomeIcon icon={faCommentDots} className="text-gray-400 mt-1" />
                    <p className="italic leading-relaxed">{fb.comments}</p>
                </div>
            )}
        </li>
    );
};

/* ---------- Page ---------- */
export default function Feedback({ feedbacks }) {
    // safeguards
    const rows = Array.isArray(feedbacks) ? feedbacks : [];

    // filters/sort
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("newest"); // newest | rating_desc | rating_asc
    const [minStars, setMinStars] = useState(0); // 0..5

    // debounce search
    const [query, setQuery] = useState("");
    useEffect(() => {
        const id = setTimeout(() => setQuery(q.trim().toLowerCase()), 250);
        return () => clearTimeout(id);
    }, [q]);

    // summary stats
    const stats = useMemo(() => {
        if (!rows.length) {
            return {
                total: 0,
                avg: 0,
                comm: 0,
                nego: 0,
                prof: 0,
                know: 0,
            };
        }
        const comm = mean(rows.map((r) => Number(r.communication || 0)));
        const nego = mean(rows.map((r) => Number(r.negotiation || 0)));
        const prof = mean(rows.map((r) => Number(r.professionalism || 0)));
        const know = mean(rows.map((r) => Number(r.knowledge || 0)));
        const avg = mean([comm, nego, prof, know]);
        return {
            total: rows.length,
            avg,
            comm,
            nego,
            prof,
            know,
        };
    }, [rows]);

    // filtered + sorted
    const list = useMemo(() => {
        let arr = [...rows];

        if (query) {
            arr = arr.filter((fb) => {
                const hay = `${fb?.sender?.name || ""} ${fb?.comments || ""}`.toLowerCase();
                return hay.includes(query);
            });
        }

        if (minStars > 0) {
            arr = arr.filter((fb) => {
                const avg = mean([
                    Number(fb.communication || 0),
                    Number(fb.negotiation || 0),
                    Number(fb.professionalism || 0),
                    Number(fb.knowledge || 0),
                ]);
                return avg >= minStars - 0.49; // be a bit lenient
            });
        }

        arr.sort((a, b) => {
            const avgA =
                mean([
                    Number(a.communication || 0),
                    Number(a.negotiation || 0),
                    Number(a.professionalism || 0),
                    Number(a.knowledge || 0),
                ]) || 0;
            const avgB =
                mean([
                    Number(b.communication || 0),
                    Number(b.negotiation || 0),
                    Number(b.professionalism || 0),
                    Number(b.knowledge || 0),
                ]) || 0;

            if (sort === "rating_desc") return avgB - avgA;
            if (sort === "rating_asc") return avgA - avgB;

            // newest
            return new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
        });

        return arr;
    }, [rows, query, sort, minStars]);

    return (
        <AgentLayout>
            <div className="px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Agent Feedback</h2>
                        <p className="text-sm text-gray-600">Read what clients say about your work and track your performance.</p>
                    </div>

                    {/* Quick summary badge */}
                    <div className="flex items-center gap-2">
                        <RatingBadge value={stats.avg || 0} />
                        <span className="text-sm text-gray-500">({stats.total} {stats.total === 1 ? "review" : "reviews"})</span>
                    </div>
                </div>

                {/* Summary panel */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* left: overall number + stars */}
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-primary/10 text-primary w-16 h-16 flex items-center justify-center text-2xl font-bold">
                                {(stats.avg || 0).toFixed(1)}
                            </div>
                            <div>
                                <StarRow value={clamp5(Math.round((stats.avg || 0)))} size="text-xl" />
                                <div className="text-xs text-gray-500 mt-1">{stats.total} total</div>
                            </div>
                        </div>

                        {/* middle: bars */}
                        <div className="grid grid-cols-2 gap-4">
                            <Bar label="Communication" value={stats.comm || 0} />
                            <Bar label="Negotiation" value={stats.nego || 0} />
                            <Bar label="Professionalism" value={stats.prof || 0} />
                            <Bar label="Knowledge" value={stats.know || 0} />
                        </div>

                        {/* right: filters */}
                        <div className="flex flex-col sm:flex-row md:flex-col gap-3 sm:items-end md:items-stretch">
                            <label className="w-full">
                <span className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  Search
                </span>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search name or comment…"
                                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-primary/30 outline-none"
                                />
                            </label>

                            <label className="w-full">
                <span className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faArrowDownWideShort} />
                  Sort
                </span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:ring-2 focus:ring-primary/30"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="rating_desc">Rating: High → Low</option>
                                    <option value="rating_asc">Rating: Low → High</option>
                                </select>
                            </label>

                            <label className="w-full">
                <span className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faFilter} />
                  Min stars
                </span>
                                <select
                                    value={minStars}
                                    onChange={(e) => setMinStars(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:ring-2 focus:ring-primary/30"
                                >
                                    {[0, 1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>
                                            {n === 0 ? "Any" : `${n}+`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                {/* List / Empty */}
                {!list.length ? (
                    <div className="text-center text-gray-500 bg-white py-12 rounded-xl border border-gray-200 text-base">
                        No feedback has been submitted for this agent yet.
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {list.map((fb) => (
                            <FeedbackCard key={fb.id} fb={fb} />
                        ))}
                    </ul>
                )}
            </div>
        </AgentLayout>
    );
}
