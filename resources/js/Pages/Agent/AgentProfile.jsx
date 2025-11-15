import React, { useEffect, useMemo, useRef, useState } from "react";
import {Head, Link} from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/Components/NavBar";
import FeedbackTab from "@/Components/FeedbackTab"; // Assuming this is defined
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    MapPinIcon,
    CheckCircleIcon,
    StarIcon,
    PhoneIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faMapMarkerAlt, faPhoneAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import BackButton from "@/Components/BackButton.jsx";

/* -------------------------------- Helpers -------------------------------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const formatPHP = (n) =>
    n || n === 0
        ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(n))
        : "—";
const statusClass = (status) => {
    switch ((status || "").toLowerCase()) {
        case "available":
            return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-semibold"; // Subtle color, bolder text
        case "reserved":
            // ... (statusClass function remains the same)
            return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 font-semibold";
        case "sold":
            return "bg-rose-50 text-rose-700 ring-1 ring-rose-200 font-semibold";
        default:
            return "bg-gray-50 text-gray-700 ring-1 ring-gray-200 font-semibold";
    }
};

/* ------------------------------ Tabs config ------------------------------ */
const TABS = [
    { name: "Listings", key: "listing", icon: HomeIcon }, // Renamed for clarity
    { name: "Feedback", key: "feedback", icon: ChatBubbleLeftRightIcon },
];

/* ------------------------------ UI Subparts ------------------------------ */
function StatCard({ value, label, icon: Icon }) {
    // ... (StatCard function remains the same)
    return (
        // Removed border, increased shadow for a lifted look
        <div className="flex-1 rounded-2xl bg-white p-5 shadow-lg transition-shadow hover:shadow-xl">
            <div className="flex items-center gap-4">
                {/* Branded icon background - TEAL */}
                <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center">
                    {Icon ? <Icon className="h-7 w-7 text-teal-600" /> : null}
                </div>
                <div>
                    {/* Bolder, slightly larger value */}
                    <div className="text-2xl font-bold leading-tight text-gray-900">{value}</div>
                    <div className="text-gray-600 text-sm">{label}</div>
                </div>
            </div>
        </div>
    );
}

function ImageWithFallback({ src, alt, className }) {
    // ... (ImageWithFallback function remains the same)
    const [ok, setOk] = useState(true);
    return (
        <img
            src={ok && src ? src : "/placeholder.jpg"}
            alt={alt || "Property image"}
            className={className}
            onError={() => setOk(false)}
            loading="lazy"
        />
    );
}

function PropertyCard({ item }) {
    // ... (PropertyCard function remains the same)
    const data = item?.property || item;
    const id = data?.id ?? item?.id;
    const status = (item?.status || data?.status || "").toLowerCase();

    function formatPHPShort(value) {
        if (value == null) return '';

        const formatNumber = (num, suffix) => {
            // ... (formatPHPShort function remains the same)
            const short = num.toFixed(2);
            // Remove trailing zeros and unnecessary decimal point
            return `₱${parseFloat(short)}${suffix}`;
        };

        if (value >= 1_000_000_000) {
            return formatNumber(value / 1_000_000_000, 'B');
        } else if (value >= 1_000_000) {
            return formatNumber(value / 1_000_000, 'M');
        } else if (value >= 1_000) {
            return formatNumber(value / 1_000, 'K');
        }

        return `₱${value.toLocaleString()}`;
    }


    return (
        <motion.div
            layout
            // Removed border, stronger shadow on hover
            className="w-full rounded-2xl bg-white shadow-xl overflow-hidden transition-shadow"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
            <Link href={`/properties/${id}`}>
                {/* ... (rest of PropertyCard JSX remains the same) */}
                <div className="relative">
                    <ImageWithFallback
                        src={data?.image_url ? `/storage/${data.image_url}` : undefined}
                        alt={data?.title || "Property image"}
                        className="h-52 w-full object-cover" // Increased height for better visual impact
                    />
                    <span
                        className={cn(
                            "absolute top-3 left-3 px-3 py-1 text-xs rounded-full backdrop-blur-sm", // Subtle backdrop blur
                            statusClass(status)
                        )}
                    >
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
                    </span>
                </div>
                <div className="p-4">
                    <p className="mt-1 text-xs font-medium text-gray-500 flex items-center gap-1 line-clamp-1">
                        {/* TEAL color for map icon */}
                        <MapPinIcon className="h-4 w-4 text-teal-500" /> {data?.address || "Address unavailable"}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mt-1">
                        {data?.title || "Untitled Property"}
                    </h3>
                    {/* TEAL color for price */}
                    <p className="mt-2 text-xl font-extrabold text-teal-700 flex items-center gap-1">
                        {formatPHPShort(data.price)}
                    </p>
                </div>
            </Link>
            {/* Removed the 'View Details' button from here to rely on the card link */}
        </motion.div>
    );
}

/* --------------------------------- Main ---------------------------------- */
const PAGE_SIZE_DEFAULT = 9;

export default function AgentProfile({ agent }) {
    // ... (state and memoized values remain the same)
    const [currentTab, setCurrentTab] = useState("listing");
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const tabRefs = useRef({});

    // tolerate different shapes coming from backend
    const rawListings = useMemo(() => {
        if (Array.isArray(agent?.property_listings) && agent.property_listings.length) return agent.property_listings;
        return Array.isArray(agent?.listing) ? agent.listing : [];
    }, [agent]);

    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };
    const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

// Show no .00 for whole numbers. If null/undefined, return "—"
    const formatRating = (n) => {
        if (n == null) return "—";
        return Number.isInteger(n) ? String(n) : n.toFixed(1);
    };


    // average rating (reads agent.rating or averages criteria from feedbacks)
    const feedbacks = useMemo(
        () => (Array.isArray(agent?.feedback_as_receiver) ? agent.feedback_as_receiver : []),
        [agent]
    );

    const { avgRating, ratingCount } = useMemo(() => {
        const feedbacksArr = Array.isArray(agent?.feedback_as_receiver)
            ? agent.feedback_as_receiver
            : [];

        const dims = ["communication", "negotiation", "professionalism", "knowledge"];
        let total = 0;
        let count = 0;

        feedbacksArr.forEach((f) => {
            dims.forEach((k) => {
                const v = Number(f?.[k]);
                if (Number.isFinite(v)) {
                    const clamped = Math.max(0, Math.min(5, v));
                    total += clamped;
                    count += 1;
                }
            });
        });

        const avg = count ? total / count : null;
        return { avgRating: avg, ratingCount: feedbacksArr.length };
    }, [agent]);




    // pagination
    const totalPages = Math.max(1, Math.ceil(rawListings.length / pageSize));
    const paged = useMemo(
        () => rawListings.slice((page - 1) * pageSize, page * pageSize),
        [rawListings, page, pageSize]
    );

    // move underline
    useEffect(() => {
        // ... (useEffect remains the same)
        const el = tabRefs.current[currentTab];
        if (el) {
            const { offsetLeft: left, offsetWidth: width } = el;
            setUnderlineStyle({ left, width });
        }
        // Reset page when switching tabs (important for listing tab)
        setPage(1);
    }, [currentTab]);

    const headerAvatar = (agent?.name || "?").charAt(0).toUpperCase();
    const soldCount = useMemo(
        () => rawListings.filter((l) => (l?.status || l?.property?.status || "").toLowerCase() === "sold").length,
        [rawListings]
    );

    const renderListings = () => (
        <>
            {/* ... (renderListings function remains the same) */}
            {paged.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No listings yet.</div>
            ) : (
                // Used a lighter gap for a denser, cleaner look
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paged.map((p) => (
                        <PropertyCard key={p.id || p.property?.id} item={p} />
                    ))}
                </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">Showing {paged.length} of {rawListings.length} listings. Page {page} of {totalPages}</div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={cn("rounded-xl px-4 py-2 text-sm border transition", page === 1 ? "text-gray-400 bg-gray-50 cursor-not-allowed" : "hover:bg-teal-50 hover:border-teal-200 text-gray-700")}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={cn("rounded-xl px-4 py-2 text-sm border transition", page === totalPages ? "text-gray-400 bg-gray-50 cursor-not-allowed" : "hover:bg-teal-50 hover:border-teal-200 text-gray-700")}
                        >
                            Next
                        </button>
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="ml-2 rounded-xl border-gray-300 py-2 text-sm focus:ring-teal-500">
                            {[6, 9, 12, 15, 18].map((n) => (
                                <option key={n} value={n}>{n}/page</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </>
    );

    const renderContent = () => {
        // ... (renderContent function remains the same)
        switch (currentTab) {
            case "listing":
                return (
                    <motion.div key="listing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {renderListings()}
                    </motion.div>
                );
            case "feedback":
                return (
                    <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        <FeedbackTab feedbacks={feedbacks} />
                    </motion.div>
                );
            default:
                return null;
        }
    };




    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="mx-auto rounded-2xl overflow-hidden shadow-xl bg-white max-w-7xl">
                <NavBar />
                <Head title='Agent Profile'/>

                {/* The previous BackButton placement is removed here */}
                {/* <div className="absolute top-24 left-80 sm:left-6 z-20">
                    <BackButton/>
                </div> */}

                {/* Header Banner - TEAL gradient - MUST be 'relative' to position children 'absolute' */}
                <div className="bg-gradient-to-r from-teal-700 to-emerald-600 h-48 relative">

                    {/* 👇 New BackButton placement: INSIDE the banner div */}
                    <div className="absolute top-4 left-4 z-20">
                        <BackButton
                            className="inline-flex items-center gap-1.5 p-1 text-primary font-semibold rounded-full hover:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                        />
                    </div>

                    <div className="absolute bottom-[-3rem] left-6 sm:left-10">
                        {/* Avatar container */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-4 border-teal-500 text-teal-700 flex items-center justify-center text-3xl font-bold shadow-2xl overflow-hidden">
                            {agent?.photo_url ? (
                                <img
                                    src={`/storage/${agent.photo_url}`}
                                    alt={agent.name || "Agent avatar"}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                agent?.name?.[0]?.toUpperCase() || "A"
                            )}
                        </div>
                    </div>
                </div>

                {/* Name + role + rating - Adjusted padding for mobile */}
                <div className="pl-6 pt-16 pb-4 pr-6 sm:pl-36 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    {/* ... (rest of the component structure remains the same) */}
                    <div>
                        {/* Larger font for name */}
                        <h1 className="text-3xl font-extrabold text-gray-900">{agent?.name || "Agent"}</h1>
                        <p className="text-md text-gray-500">MJVI Certified Agent</p>
                    </div>
                    {(ratingCount > 0 || avgRating != null) && (
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    className={`h-5 w-5 ${i < Math.round(avgRating ?? 0) ? "text-amber-400" : "text-gray-300"}`}
                                />
                            ))}
                            <span className="ml-2 text-gray-700 font-semibold">{formatRating(avgRating)}</span>
                            {ratingCount > 0 && <span className="text-sm text-gray-500">({ratingCount} reviews)</span>}
                        </div>
                    )}

                </div>

                {/* Quick stats - Responsive grid */}
                <div className="px-4 sm:px-6 lg:px-8 pb-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        <StatCard value={rawListings.length} label="Total Listings" icon={HomeIcon} />
                        <StatCard value={soldCount} label="Sold Listings" icon={CheckCircleIcon} />
                        <StatCard value={feedbacks.length} label="Total Feedback" icon={ChatBubbleLeftRightIcon} />
                        <StatCard value={avgRating != null ? formatRating(avgRating) : "—"} label="Avg Rating" icon={StarIcon} />
                    </div>
                </div>

                {/* Tabs - Centered and TEAL */}
                <div className="border-t border-gray-200 mt-2 relative">
                    {/* Centered tabs for mobile */}
                    <div className="flex justify-center md:justify-end md:pr-6">
                        <div className="relative w-full md:w-fit">
                            <nav className="flex space-x-6 relative justify-center">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        ref={(el) => (tabRefs.current[tab.key] = el)}
                                        onClick={() => setCurrentTab(tab.key)}
                                        className={cn(
                                            "flex items-center px-4 py-3 text-sm font-medium transition-colors duration-300",
                                            // TEAL color change
                                            currentTab === tab.key ? "text-teal-600" : "text-gray-500 hover:text-gray-900"
                                        )}
                                        aria-current={currentTab === tab.key ? "page" : undefined}
                                        aria-selected={currentTab === tab.key}
                                        role="tab"
                                    >
                                        <tab.icon
                                            className={cn(
                                                "h-5 w-5 mr-2 transition-transform duration-300",
                                                // TEAL color change
                                                currentTab === tab.key ? "scale-100 text-teal-600" : "text-gray-400"
                                            )}
                                        />
                                        {tab.name}
                                        {/* Simplified count display */}
                                        {tab.key === "listing" && (
                                            <span className="ml-1 text-xs text-gray-400 font-normal">({rawListings.length})</span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                            <motion.span
                                // TEAL color for underline
                                className="absolute bottom-0 h-0.5 bg-teal-600"
                                animate={{ left: underlineStyle.left, width: underlineStyle.width }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col mx-auto md:flex-row gap-6 mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Left column: About/Contact - Full width on mobile, 1/3 on desktop */}
                <div className="md:w-1/3 flex flex-col gap-y-6 w-full">
                    {/* Profile Completeness Card */}
                    <div className="rounded-2xl border border-gray-200 p-6 flex items-center justify-between gap-4 shadow-md bg-white">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Profile Completeness</p>
                                <p className="font-bold text-gray-800">
                                    {[agent?.bio, agent?.address, agent?.contact_number, agent?.email].filter(Boolean).length}/4 fields filled
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* About Card */}
                    <div className="border rounded-2xl p-6 flex flex-col gap-4 bg-white shadow-md">
                        <h2 className="text-lg font-bold text-teal-700">About Me</h2>
                        <p className="text-gray-600 text-sm italic">{agent?.bio || "The agent has not provided a bio yet."}</p>
                    </div>

                    {/* Contact Card */}
                    <div className="border rounded-2xl p-6 flex flex-col gap-4 bg-white shadow-md">
                        <h2 className="text-lg font-bold text-teal-700">Contact Information</h2>
                        {[
                            { icon: faMapMarkerAlt, value: agent?.address, fallback: "Address not available" },
                            { icon: faPhoneAlt, value: agent?.contact_number, fallback: "No contact number" },
                            { icon: faEnvelope, value: agent?.email, fallback: "Email not provided" },
                        ].map((info, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm">
                                <FontAwesomeIcon icon={info.icon} className="mt-1 text-teal-500" />
                                <p className="text-gray-800 break-words font-medium">{info.value || <span className="text-gray-400">{info.fallback}</span>}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Listings/Content - Full width on mobile, 2/3 on desktop */}
                <div className="md:w-2/3 w-full bg-white rounded-2xl p-4 border sm:p-6 shadow-inner min-h-[75vh]">
                    <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                </div>
            </div>
        </div>
    );
}
