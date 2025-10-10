// resources/js/Pages/Buyer/Inquiries.jsx
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import {
    faLocationDot, faClock, faPaperPlane, faTrashAlt, faCalendarCheck,
    faHouseChimney, faEnvelope, faPhone, faFolderOpen, faCircleCheck,
    faCalendarPlus, faHandshakeSimple,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Head, Link, router } from "@inertiajs/react";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

/* ---------- utils ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const arr = (v) => (Array.isArray(v) ? v : []);
const peso = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
};
const statusBadge = (status) => {
    const s = (status ?? "").toLowerCase();
    switch (s) {
        case "accepted": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "rejected": return "bg-rose-50 text-rose-700 border-rose-200";
        case "cancelled":
        case "cancelled by buyer": return "bg-gray-50 text-gray-700 border-gray-200";
        default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
};

/* ---------- progress ---------- */
const steps = [
    { key: "requested", label: "Requested", icon: faPaperPlane },
    { key: "accepted",  label: "Accepted",  icon: faCircleCheck },
    { key: "visit",     label: "Visit",     icon: faCalendarPlus },
    { key: "deal",      label: "Deal",      icon: faHandshakeSimple },
];

function computeStepIndex(inquiry) {
    const s = (inquiry?.status || "").toLowerCase();
    const hasVisit = arr(inquiry?.trippings).length > 0;
    if (s === "rejected") return 0;
    if (s === "pending")  return 0;
    if (s === "accepted" && !hasVisit) return 1;
    if (s === "accepted" &&  hasVisit) return 2;
    if (["closed", "completed", "won"].includes(s)) return 3;
    return 0;
}

function parseVisitDT(t) {
    const date = t?.visit_date || "";
    const time = (t?.visit_time || "00:00:00").slice(0, 8);
    return dayjs(`${date}T${time}`);
}

/* ---------- small pieces ---------- */
function SectionTitle({ icon, title, subtitle }) {
    return (
        <header className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                <FontAwesomeIcon icon={icon} className="mr-2 text-gray-800" aria-hidden />
                {title}
            </h1>
            {subtitle && <p className="mt-1 text-gray-600 text-sm sm:text-base">{subtitle}</p>}
        </header>
    );
}

function EmptyState() {
    return (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-10 sm:p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <FontAwesomeIcon icon={faFolderOpen} className="text-gray-500" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">No inquiries yet</h2>
            <p className="mt-2 text-gray-600">Browse properties and send an inquiry to get started.</p>
            <div className="mt-6 inline-flex gap-2">
                <Link href="/properties" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Explore Properties
                </Link>
                <Link href="/favourites" className="px-4 py-2 rounded-md border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300">
                    View Favourites
                </Link>
            </div>
        </div>
    );
}

function UpcomingVisits({ items = [] }) {
    return (
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming visits</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">Your scheduled property viewings.</p>

            {items.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    No upcoming visits. Once an agent confirms your schedule, it appears here.
                </div>
            ) : (
                <ul className="divide-y">
                    {items.map((t) => {
                        const p = t.property || {};
                        const contact = t.contact || {};
                        const img = p?.image_url ? `/storage/${p.image_url}` : "/placeholder.png";
                        const when = t._dt;
                        const niceDate = when.format("MMM D, YYYY");
                        const niceTime = when.format("HH:mm");
                        return (
                            <li key={`visit-${t.id}-${t.inquiryId}`} className="py-3 flex items-start gap-3">
                                <img
                                    src={img}
                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                    alt={p?.title || "Property"}
                                    className="w-12 h-12 rounded object-cover ring-1 ring-gray-200 bg-white"
                                    loading="lazy"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{p?.title || "Property"}</p>
                                    <p className="text-xs text-gray-600 truncate">
                                        <FontAwesomeIcon icon={faLocationDot} className="mr-1" aria-hidden />
                                        {p?.address || "—"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" aria-hidden />
                                        {niceDate} • {niceTime}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        With: {contact?.name || "Agent/Broker"} • Status: {t?.status || "pending"}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <Link
                                        href={`/inquiries/${t.inquiryId}`}
                                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                        title="Open conversation"
                                    >
                                        View
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

/* ---------- page ---------- */
export default function Inquiries({
                                      inquiries = { data: [], links: [] },
                                      status = "",
                                      allCount = 0,
                                      pendingCount = 0,
                                      acceptedCount = 0,
                                      cancelledCount = 0,
                                      rejectedCount = 0,
                                  }) {
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelId, setCancelId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(status?.trim() ? status : "All");

    const list = arr(inquiries?.data);

    // sidebar stats (kept for tabs)
    const counts = useMemo(
        () => ({ pending: pendingCount, accepted: acceptedCount, cancelled: cancelledCount, rejected: rejectedCount }),
        [pendingCount, acceptedCount, cancelledCount, rejectedCount]
    );

    // compute upcoming trippings (sorted ascending)
    const upcomingTrippings = useMemo(() => {
        const items = [];
        for (const inq of list) {
            const trips = arr(inq?.trippings);
            if (!trips.length) continue;
            for (const t of trips) {
                const dt = parseVisitDT(t);
                if (dt.isAfter(dayjs())) {
                    items.push({
                        ...t,
                        _dt: dt,
                        property: inq?.property || null,
                        contact: inq?.agent || inq?.broker || null,
                        inquiryId: inq?.id,
                    });
                }
            }
        }
        return items.sort((a, b) => a._dt.valueOf() - b._dt.valueOf());
    }, [list]);

    const handleCancelInquiry = () => {
        if (!cancelId) return;
        router.patch(`/inquiries/${cancelId}/cancel`, {}, {
            onSuccess: () => { setIsCancelModalOpen(false); setCancelId(null); },
            onError: (errors) => console.error("Failed to cancel inquiry", errors),
        });
    };

    return (
        <BuyerLayout>
            <Head title="Inquiries" />
            <div className="py-4 sm:py-6">
                {/* Modals */}
                {isAddVisitModal && (
                    <ScheduleVisitModal
                        open={isAddVisitModal}
                        setOpen={setIsAddVisitModal}
                        visitData={selectedVisitData}
                    />
                )}
                <ConfirmDialog
                    onConfirm={handleCancelInquiry}
                    confirmText="Confirm"
                    open={isCancelModalOpen}
                    setOpen={setIsCancelModalOpen}
                    title="Cancel Inquiry"
                    description="Are you sure you want to cancel this inquiry?"
                    cancelText="Close"
                />

                {/* Header */}
                <SectionTitle
                    icon={faEnvelope}
                    title="My Inquiries"
                    subtitle="Track your property inquiries, manage schedules, and move forward with clear next steps."
                />

                {/* Tabs */}
                <div className="sticky top-16 z-10 -mx-4 sm:mx-0 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-4 sm:px-0 py-2 border-y sm:border-none">
                    <BuyerInquiriesFilterTab
                        setSelectedStatus={setSelectedStatus}
                        count={[allCount, pendingCount, acceptedCount, cancelledCount, rejectedCount]}
                        selectedStatus={selectedStatus}
                    />
                </div>

                {/* Helper panel */}
                <UpcomingVisits items={upcomingTrippings} />

                {/* Empty state */}
                {list.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="mt-6 space-y-4">
                        {list.map((inquiry) => {
                            const property    = inquiry?.property ?? {};
                            const agent       = inquiry?.agent ?? null;
                            const broker      = inquiry?.broker ?? null;
                            const contact     = agent || broker || {};
                            const message     = inquiry?.notes || "";
                            const createdAgo  = inquiry?.created_at ? dayjs(inquiry.created_at).fromNow() : "—";
                            const s           = (inquiry?.status || "").toLowerCase();
                            const isAccepted  = s === "accepted";
                            const isCancelled = s === "cancelled" || s === "cancelled by buyer";
                            const hasTrips    = arr(inquiry?.trippings).length > 0;
                            const img         = property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png";
                            const stepIndex   = computeStepIndex(inquiry);

                            return (
                                <li key={`inq-${inquiry?.id}`} className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-gray-300">
                                    <article className="p-4 sm:p-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-12">
                                        {/* Image */}
                                        <div className="md:col-span-3">
                                            <div className="relative rounded-xl overflow-hidden h-44 sm:h-48 shadow-sm">
                                                <img
                                                    src={img}
                                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                    alt={property?.title || "Property Image"}
                                                    className="w-full h-full object-cover bg-gray-100 group-hover:scale-[1.02] transition-transform"
                                                    loading="lazy"
                                                />
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                                                    {peso(property?.price)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info + Progress */}
                                        <div className="md:col-span-6 flex flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight line-clamp-2">
                                                    {property?.title ?? "Unknown Property"}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        "shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border",
                                                        statusBadge(inquiry?.status)
                                                    )}
                                                    title={`Status: ${inquiry?.status ?? "Pending"}`}
                                                >
                          <FontAwesomeIcon icon={faClock} className="mr-1" aria-hidden />
                                                    {inquiry?.status ?? "Pending"}
                        </span>
                                            </div>

                                            <p className="mt-1 text-gray-700 text-sm">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-gray-500" aria-hidden />
                                                {property?.address ?? "No address provided"}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-0.5">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" aria-hidden />
                                                {property?.property_type ?? "Type"} <span className="text-gray-400">•</span>{" "}
                                                {property?.sub_type ?? "Sub-type"}
                                            </p>

                                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-sm text-gray-800">
                                                    <strong className="mr-1">Your message:</strong>
                                                    <span className="line-clamp-3">{message || "No message provided."}</span>
                                                </p>
                                            </div>

                                            {/* progress */}
                                            <div className="mt-3">
                                                <ol className="flex items-center flex-wrap gap-2">
                                                    {steps.map((st, i) => {
                                                        const active = i <= stepIndex;
                                                        return (
                                                            <li key={st.key} className="flex items-center">
                                                                <div
                                                                    className={cn(
                                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border",
                                                                        active
                                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                            : "bg-gray-50 text-gray-600 border-gray-200"
                                                                    )}
                                                                    title={st.label}
                                                                >
                                                                    <FontAwesomeIcon icon={st.icon} className="w-3.5 h-3.5" aria-hidden />
                                                                    {st.label}
                                                                </div>
                                                                {i !== steps.length - 1 && <span className="mx-2 hidden sm:block h-px w-6 bg-gray-200" />}
                                                            </li>
                                                        );
                                                    })}
                                                </ol>
                                                <p className="text-[11px] text-gray-500 mt-1">Sent {createdAgo}</p>
                                            </div>
                                        </div>

                                        {/* Contact + Actions */}
                                        <div className="md:col-span-3 flex flex-col justify-between gap-3">
                                            <div className="flex items-center">
                                                <div className="w-11 h-11 rounded-full overflow-hidden mr-3 border border-gray-200 bg-white">
                                                    {contact?.photo_url ? (
                                                        <img
                                                            src={`/storage/${contact.photo_url}`}
                                                            alt={contact?.name ?? "Contact"}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => (e.currentTarget.style.display = "none")}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full bg-secondary text-white font-semibold text-base">
                                                            {(contact?.name || "?").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{contact?.name ?? "Contact"}</p>
                                                    <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p title="Email" className="truncate">
                                                    <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-gray-500" aria-hidden />
                                                    {contact?.email ?? "N/A"}
                                                </p>
                                                <p title="Phone" className="truncate">
                                                    <FontAwesomeIcon icon={faPhone} className="mr-1 text-gray-500" aria-hidden />
                                                    {contact?.phone ?? "+63 912 345 6789"}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                {/* Schedule Visit / Status */}
                                                {isAccepted ? (
                                                    hasTrips ? (
                                                        <div
                                                            className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                                                            aria-label="Visit Scheduled"
                                                            title="Your visit is already scheduled"
                                                        >
                                                            <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" aria-hidden />
                                                            Scheduled
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="w-full px-4 py-2 rounded-md bg-primary text-white hover:bg-accent font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                                            onClick={() => {
                                                                setSelectedVisitData({
                                                                    property,
                                                                    agent: agent ?? null,
                                                                    broker: broker ?? null,
                                                                    inquiryId: inquiry?.id ?? null,
                                                                });
                                                                setIsAddVisitModal(true);
                                                            }}
                                                            title="Pick a date/time to visit"
                                                        >
                                                            <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" aria-hidden />
                                                            Schedule Visit
                                                        </button>
                                                    )
                                                ) : (
                                                    <div
                                                        className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-gray-50 text-gray-700 border border-gray-200 font-medium"
                                                        aria-label="Visit Status"
                                                        title="Wait for the agent/broker to accept your inquiry to schedule a visit"
                                                    >
                                                        <FontAwesomeIcon icon={faClock} className="mr-2" aria-hidden />
                                                        {inquiry?.status ?? "Pending"}
                                                    </div>
                                                )}

                                                {/* View */}
                                                <Link
                                                    href={isCancelled ? "#" : `/inquiries/${inquiry?.id}`}
                                                    onClick={(e) => { if (isCancelled) e.preventDefault(); }}
                                                    className={cn(
                                                        "w-full text-center px-4 py-2 rounded-md text-sm font-medium transition border focus:outline-none focus:ring-2 focus:ring-offset-2",
                                                        isCancelled
                                                            ? "bg-gray-200 text-white cursor-not-allowed border-gray-200"
                                                            : "bg-white border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white focus:ring-gray-300"
                                                    )}
                                                    aria-disabled={isCancelled}
                                                    title={isCancelled ? "This inquiry is cancelled" : "Open conversation/details"}
                                                >
                                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" aria-hidden />
                                                    View
                                                </Link>

                                                {/* Cancel */}
                                                {isCancelled ? (
                                                    <div className="w-full py-2 rounded-md bg-gray-100 text-center text-gray-500 font-medium border border-gray-200">
                                                        Cancelled
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2 rounded-md text-sm font-medium transition bg-rose-600 hover:bg-rose-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                                        onClick={() => {
                                                            setCancelId(inquiry?.id ?? null);
                                                            setIsCancelModalOpen(true);
                                                        }}
                                                        title="Cancel this inquiry"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} className="mr-2" aria-hidden />
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Pagination */}
                <nav className="flex flex-wrap gap-2 justify-end mt-6" aria-label="Pagination">
                    {arr(inquiries?.links).map((link, i) =>
                        link?.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={cn(
                                    "px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    link.active
                                        ? "bg-primary text-white font-semibold border-primary focus:ring-primary"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200 focus:ring-gray-300"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                aria-current={link.active ? "page" : undefined}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link?.label ?? "" }}
                                aria-disabled="true"
                            />
                        )
                    )}
                </nav>
            </div>
        </BuyerLayout>
    );
}
