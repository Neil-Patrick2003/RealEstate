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
    faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { Search, SlidersHorizontal, ArrowDownWideNarrow, User, MessageSquare } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
// Using Lucide icons for a more modern, consistent look where possible

/* ---------- small utils ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const clamp5 = (n) => Math.max(0, Math.min(5, Math.round(n)));

/* ---------- Star components (Updated) ---------- */
const StarRow = ({ value, size = "text-lg" }) => (
    <div className={cn("flex items-center gap-1", size)}>
        {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={faStar}
                // Highlighting stars with a deep yellow for contrast
                className={i < value ? "text-amber-500" : "text-gray-300"}
            />
        ))}
    </div>
);

const RatingBadge = ({ value }) => (
    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold shrink-0">
        <FontAwesomeIcon icon={faStar} className="h-3 w-3" />
        {value.toFixed(1)}
    </div>
);

const Bar = ({ label, value, color = "bg-primary" }) => {
    const percentage = (value / 5) * 100;
    return (
        <div>
            <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                <span className="font-medium">{label}</span>
                <span className="font-bold">{value.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                    className={cn("h-2 rounded-full transition-all duration-300", color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/* ---------- Card (Refactored for mobile) ---------- */
const FeedbackCard = ({ fb }) => {
    const name = fb?.sender?.name || "Anonymous Client";
    const initial = name?.charAt(0)?.toUpperCase() || "U";
    const when = dayjs(fb.created_at).format("MMM D, YYYY");

    const overallAvg = mean([
        Number(fb.communication || 0),
        Number(fb.negotiation || 0),
        Number(fb.professionalism || 0),
        Number(fb.knowledge || 0),
    ]) || 0;


    return (
        <li className="bg-white p-5 sm:p-6 rounded-xl  hover:shadow-xl transition duration-300">
            {/* Header */}
            <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center rounded-full text-base font-bold uppercase shrink-0">
                        {/* Using User icon for a cleaner look */}
                        <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-500">{when}</p>
                    </div>
                </div>

                {/* Overall Rating Badge */}
                <RatingBadge value={overallAvg} />
            </div>

            {/* Comment (Moved up and emphasized) */}
            {fb.comments && (
                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-1" />
                        <p className="leading-relaxed font-medium italic">{fb.comments}</p>
                    </div>
                </div>
            )}

            {/* Characteristics */}
            {Array.isArray(fb.characteristics) && fb.characteristics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {fb.characteristics.map((c) => (
                        <span
                            key={c.id ?? c.characteristic}
                            className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                            {c.characteristic}
                        </span>
                    ))}
                </div>
            )}

            {/* Ratings grid (Mobile: stacked, Desktop: grid-cols-4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 pt-4 border-t border-gray-100">
                {[
                    ["Communication", fb.communication],
                    ["Negotiation", fb.negotiation],
                    ["Professionalism", fb.professionalism],
                    ["Knowledge", fb.knowledge],
                ].map(([label, value], i) => (
                    <div key={i} className="flex items-center justify-between p-2 sm:block sm:p-0">
                        <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
                        <div className="flex items-center gap-2">
                            {/* Clamp value and pass to StarRow */}
                            <StarRow value={clamp5(Number(value || 0))} size="text-base" />
                            <span className="text-sm font-bold text-gray-800 shrink-0">({Number(value || 0).toFixed(1)})</span>
                        </div>
                    </div>
                ))}
            </div>
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

    // summary stats (UNCHANGED LOGIC)
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

    // filtered + sorted (UNCHANGED LOGIC)
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
                ]) || 0;
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

    // Isolated Filter Component for clarity and re-use
    const FilterPanel = () => (
        <div className="flex flex-col gap-4">
            <label className="w-full">
                <span className="text-xs text-gray-600 flex items-center gap-2 mb-1 font-semibold">
                    <Search className="w-3 h-3" />
                    Search
                </span>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Name or comment…"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 shadow-inner focus:bg-white focus:ring-1 focus:ring-primary/50 outline-none transition"
                />
            </label>

            <label className="w-full">
                <span className="text-xs text-gray-600 flex items-center gap-2 mb-1 font-semibold">
                    <ArrowDownWideNarrow className="w-3 h-3" />
                    Sort By
                </span>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg shadow-sm bg-white focus:ring-1 focus:ring-primary/50 appearance-none"
                >
                    <option value="newest">Newest</option>
                    <option value="rating_desc">Rating: High → Low</option>
                    <option value="rating_asc">Rating: Low → High</option>
                </select>
            </label>

            <label className="w-full">
                <span className="text-xs text-gray-600 flex items-center gap-2 mb-1 font-semibold">
                    <SlidersHorizontal className="w-3 h-3" />
                    Minimum Stars
                </span>
                <select
                    value={minStars}
                    onChange={(e) => setMinStars(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg shadow-sm bg-white focus:ring-1 focus:ring-primary/50 appearance-none"
                >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                            {n === 0 ? "Any" : `${n}+ stars`}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    )

    return (
        <AuthenticatedLayout>
            <div className="px-4 py-6 space-y-6">

                {/* 1. Header & Quick Summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pb-2 border-b border-gray-200">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Client Feedback</h2>
                        <p className="text-sm text-gray-600 mt-1">Read what clients say about your work and track your performance.</p>
                    </div>

                    {/* Quick summary badge (Only visible if there are reviews) */}
                    {stats.total > 0 && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md shrink-0">
                            <RatingBadge value={stats.avg || 0} />
                            <span className="text-sm text-gray-600 font-medium">({stats.total} {stats.total === 1 ? "review" : "reviews"})</span>
                        </div>
                    )}
                </div>

                {/* --- */}

                {/* 2. Summary & Controls Panel */}
                <div className="bg-white rounded-xl p-5 shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: Overall Rating Block (Always visible) */}
                        <div className="p-4 bg-primary/5 rounded-lg flex items-center justify-start sm:justify-center lg:justify-start gap-4 shadow-inner">
                            <div className="rounded-full bg-primary text-white w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-md">
                                {(stats.avg || 0).toFixed(1)}
                            </div>
                            <div>
                                <StarRow value={clamp5(Math.round((stats.avg || 0)))} size="text-2xl" />
                                <div className="text-sm text-gray-600 mt-1 font-medium">{stats.total} total reviews</div>
                            </div>
                        </div>

                        {/* Middle: Performance Bars (Stacked on mobile, 2x2 grid on desktop) */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-4 lg:border-t-0 lg:pt-0 border-gray-200">
                            <Bar label="Communication" value={stats.comm || 0} />
                            <Bar label="Negotiation" value={stats.nego || 0} />
                            <Bar label="Professionalism" value={stats.prof || 0} />
                            <Bar label="Knowledge" value={stats.know || 0} />
                        </div>

                        {/* Right: Filters (Collapsible on Mobile, Full panel on Desktop) */}
                        <div className="mt-4 lg:mt-0 border-t pt-4 lg:border-t-0 lg:pt-0 border-gray-200">

                            {/* Mobile Collapsible Filters */}
                            <details className="lg:hidden">
                                <summary className="flex items-center gap-2 text-primary font-semibold text-base cursor-pointer">
                                    <SlidersHorizontal className="w-5 h-5" />
                                    Filter and Sort Reviews
                                </summary>
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <FilterPanel />
                                </div>
                            </details>

                            {/* Desktop Filter Panel */}
                            <div className="hidden lg:block">
                                <FilterPanel />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- */}

                {/* 3. List / Empty State */}
                {!list.length ? (
                    <div className="text-center text-gray-500 bg-white py-12 rounded-xl shadow-md text-base">
                        <FontAwesomeIcon icon={faCommentDots} className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800">No Feedback Found</h3>
                        <p className="text-sm mt-1">
                            {rows.length === 0 ? "No feedback has been submitted for this agent yet." : "No reviews match your current filters."}
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {list.map((fb) => (
                            <FeedbackCard key={fb.id} fb={fb} />
                        ))}
                    </ul>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
