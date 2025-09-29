import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faClock,
    faLocationDot,
    faHouseChimney,
    faEnvelope,
    faPhone,
    faTrashAlt,
    faPaperPlane,
    faPesoSign,
    faCommentDots,
    faCalendarPlus,
    faRedo,
    faExpand,
    faCopy,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import { Head, Link, router } from "@inertiajs/react";

dayjs.extend(relativeTime);

/* ---------- helpers ---------- */
const cn = (...cls) => cls.filter(Boolean).join(" ");

const formatPeso = (num) => {
    if (num == null || isNaN(Number(num))) return "—";
    try {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 0,
        }).format(Number(num));
    } catch {
        return `₱${Number(num).toLocaleString()}`;
    }
};

const statusTone = (status = "") => {
    const s = status.toLowerCase();
    if (s === "accepted")
        return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200";
    if (s === "rejected")
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    if (s === "cancelled" || s === "canceled")
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200";
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"; // pending/others
};

const timeBadge = (tripDate) => {
    if (!tripDate?.isValid?.()) return null;
    const now = dayjs();
    if (tripDate.isSame(now, "day")) return { label: "Today", cls: "bg-blue-50 text-blue-700" };
    if (tripDate.isAfter(now, "day")) return { label: "Upcoming", cls: "bg-emerald-50 text-emerald-700" };
    return { label: "Past", cls: "bg-slate-100 text-slate-600" };
};

const SafeImg = ({ src, alt, className }) => {
    const [err, setErr] = useState(false);
    const computed =
        err || !src
            ? "/placeholder.png"
            : src.startsWith("http")
                ? src
                : `/storage/${src}`;
    return (
        <img
            src={computed}
            alt={alt ?? ""}
            onError={() => setErr(true)}
            className={className}
            loading="lazy"
            decoding="async"
        />
    );
};

export default function Trippings({ trippings }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const list = useMemo(() => {
        // support both paginated (data) & plain arrays
        if (!trippings) return [];
        return Array.isArray(trippings) ? trippings : trippings.data ?? [];
    }, [trippings]);

    const links = useMemo(() => trippings?.links ?? [], [trippings]);

    const openScheduleModal = (trip) => {
        setSelectedVisit(trip);
        setModalOpen(true);
    };

    const handleCancelVisit = async () => {
        try {
            // Prefer explicit cancel_url if provided by backend
            if (selectedVisit?.cancel_url) {
                await router.visit(selectedVisit.cancel_url, {
                    method: "post",
                    preserveScroll: true,
                    preserveState: true,
                });
            } else if (selectedVisit?.id) {
                // Fallback route pattern (adjust to your backend if different)
                await router.visit(`/trippings/${selectedVisit.id}/cancel`, {
                    method: "post",
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        } catch (e) {
            console.error("Cancel failed:", e);
        } finally {
            setOpenCancelModal(false);
            setSelectedVisit(null);
        }
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1200);
        } catch (_) {}
    };

    const getPrimaryContact = (trip) => trip?.agent || trip?.broker || null;

    return (
        <BuyerLayout>
            <Head title="Tripping" />

            {/* Modals */}
            <ScheduleVisitModal open={modalOpen} setOpen={setModalOpen} visitData={selectedVisit} />
            <ConfirmDialog
                onConfirm={handleCancelVisit}
                setOpen={setOpenCancelModal}
                open={openCancelModal}
                title="Cancel Visit Schedule"
                description="Do you want to cancel this visit? This action cannot be undone."
                confirmText="Yes, Confirm"
            />

            <div className="mt-8 md:mt-10 py-4 ">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            Scheduled Trippings
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Keep track of your booked site visits all in one place.
                        </p>
                    </div>
                    {/* (Optional) space for a filter in the future */}
                </div>

                {/* Empty state */}
                {list.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center ring-1 ring-amber-200">
                            <FontAwesomeIcon icon={faCalendarPlus} className="text-amber-600 text-3xl" />
                        </div>
                        <h2 className="mt-6 text-xl font-semibold text-gray-900">
                            No visits yet
                        </h2>
                        <p className="mt-2 text-gray-500">
                            When you schedule a property tripping, you’ll see it here.
                        </p>
                        <Link
                            href="/properties"
                            className="inline-flex items-center mt-6 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            <FontAwesomeIcon icon={faExpand} className="mr-2" />
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {list.map((trip) => {
                            const now = dayjs();
                            const tripDate = dayjs(trip.visit_date);
                            const isFuture = tripDate.isAfter(now, "day");
                            const isToday = tripDate.isSame(now, "day");
                            const isPast = tripDate.isBefore(now, "day");
                            const contact = getPrimaryContact(trip);

                            const tb = timeBadge(tripDate);
                            const whenRel =
                                tripDate.isValid() ? (tripDate.isAfter(now) ? `in ${tripDate.fromNow(true)}` : `${tripDate.fromNow()}`) : null;

                            const timeDisplay = (() => {
                                // if visit_time is "HH:mm:ss", render as 12-hour
                                const t = trip?.visit_time ? dayjs(`1970-01-01T${trip.visit_time}`) : null;
                                return t?.isValid?.() ? t.format("hh:mm A") : "—";
                            })();

                            const viewHref = `/properties/${trip?.property?.id}`;
                            const imageSrc = trip?.property?.image_url || trip?.property?.thumbnail_url;
                            const price = trip?.property?.price;
                            const status = trip?.status ?? "pending";
                            const statusCls = statusTone(status);

                            return (
                                <article
                                    key={trip.id}
                                    className="bg-white border rounded-lg border-gray-200 hover:shadow-md transition shadow-sm focus-within:ring-2 focus-within:ring-primary/40"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 p-5 md:p-6">
                                        {/* Image */}
                                        <div className="col-span-12 lg:col-span-3">
                                            <div className="relative rounded-lg overflow-hidden h-44 md:h-48 ring-1 ring-gray-100">
                                                <Link href={viewHref} aria-label={`View ${trip?.property?.title}`}>
                                                    <SafeImg
                                                        src={imageSrc}
                                                        alt={trip?.property?.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                    />
                                                </Link>
                                                <div className="absolute bottom-2 left-2 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-black/70 text-white backdrop-blur">
                                                    <FontAwesomeIcon icon={faPesoSign} className="mr-1" />
                                                    {formatPeso(price)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                                                        {trip?.property?.title ?? "Untitled Property"}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {tb && (
                                                            <span className={cn("px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ring-inset", tb.cls)}>
                                {tb.label}
                              </span>
                                                        )}
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize",
                                                                statusCls
                                                            )}
                                                            title={status}
                                                        >
                              <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                            {status}
                            </span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 text-sm">
                                                    <FontAwesomeIcon icon={faLocationDot} className="mr-1.5" />
                                                    {trip?.property?.address ?? "Address not provided"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <FontAwesomeIcon icon={faHouseChimney} className="mr-1.5" />
                                                    {(trip?.property?.property_type ?? "—")}{" "}
                                                    {trip?.property?.sub_type ? `– ${trip.property.sub_type}` : ""}
                                                </p>

                                                <div className="mt-3 grid gap-2">
                                                    <p className="text-sm text-gray-800">
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2 text-primary" />
                                                        Visit Date:{" "}
                                                        <strong>{tripDate?.isValid?.() ? tripDate.format("MMMM D, YYYY") : "—"}</strong>
                                                        {whenRel ? <span className="text-gray-400 ml-2">({whenRel})</span> : null}
                                                    </p>
                                                    <p className="text-sm text-gray-800">
                                                        <FontAwesomeIcon icon={faClock} className="mr-2 text-primary" />
                                                        Time: <strong>{timeDisplay}</strong>
                                                    </p>

                                                    {trip?.notes && (
                                                        <div className="bg-gray-50 ring-1 ring-gray-200 rounded-md p-3 text-sm text-gray-700">
                                                            <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-primary" />
                                                            <strong>Notes:</strong> {trip.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-gray-400 mt-3">
                                                    Scheduled {trip?.created_at ? dayjs(trip.created_at).fromNow() : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact + Actions */}
                                        <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                            {contact && (
                                                <div className="flex items-center mb-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border mr-3 flex items-center justify-center bg-gray-100 ring-1 ring-gray-200">
                                                        {contact?.photo_url ? (
                                                            <SafeImg
                                                                src={contact.photo_url}
                                                                alt={contact?.name ?? "Contact"}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-600">
                                {contact?.name ? contact.name.charAt(0).toUpperCase() : "?"}
                              </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {contact?.name ?? "Unknown Contact"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{contact?.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {(contact?.contact_number || contact?.email) && (
                                                <div className="text-xs text-gray-600 space-y-1 mb-4">
                                                    {contact?.contact_number && (
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="truncate">
                                                                <FontAwesomeIcon icon={faPhone} className="mr-1.5" />
                                                                {contact.contact_number}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <a
                                                                    href={`tel:${contact.contact_number}`}
                                                                    className="underline hover:no-underline"
                                                                    aria-label="Call"
                                                                >
                                                                    Call
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyToClipboard(contact.contact_number, `num-${trip.id}`)}
                                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-100"
                                                                    title="Copy number"
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={copiedId === `num-${trip.id}` ? faCheck : faCopy}
                                                                        className={cn(
                                                                            "text-[11px]",
                                                                            copiedId === `num-${trip.id}` ? "text-emerald-600" : "text-gray-500"
                                                                        )}
                                                                    />
                                                                    {copiedId === `num-${trip.id}` ? "Copied" : "Copy"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {contact?.email && (
                                                        <p className="truncate">
                                                            <FontAwesomeIcon icon={faEnvelope} className="mr-1.5" />
                                                            <a href={`mailto:${contact.email}`} className="underline hover:no-underline">
                                                                {contact.email}
                                                            </a>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2">
                                                {/* Primary action */}
                                                {status.toLowerCase() === "accepted" && (isFuture || isToday) ? (
                                                    <Link
                                                        href={viewHref}
                                                        className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium text-center transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                    >
                                                        <FontAwesomeIcon icon={faExpand} className="mr-2" />
                                                        View
                                                    </Link>
                                                ) : status.toLowerCase() === "accepted" && isPast ? (
                                                    <button
                                                        onClick={() => openScheduleModal(trip)}
                                                        className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                                                    >
                                                        <FontAwesomeIcon icon={faRedo} className="mr-2" />
                                                        Missed? Reschedule
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openScheduleModal(trip)}
                                                        className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                    >
                                                        <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                                                        Reschedule
                                                    </button>
                                                )}

                                                {/* Message */}
                                                {trip?.message_url ? (
                                                    <Link
                                                        href={trip.message_url}
                                                        className="w-full px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md text-sm font-medium text-center transition focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                                                    >
                                                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                        Message
                                                    </Link>
                                                ) : contact?.email ? (
                                                    <a
                                                        href={`mailto:${contact.email}?subject=Regarding our tripping on ${tripDate?.isValid?.() ? tripDate.format("MMM D") : ""}`}
                                                        className="w-full px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md text-sm font-medium text-center transition focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                                                    >
                                                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                        Message
                                                    </a>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
                                                        title="No contact method available"
                                                    >
                                                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                        Message
                                                    </button>
                                                )}

                                                {/* Cancel */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedVisit(trip);
                                                        setOpenCancelModal(true);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {links?.length > 0 && (
                    <nav className="flex flex-wrap gap-2 mt-6 justify-end" aria-label="Pagination">
                        {links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveScroll
                                    className={cn(
                                        "px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition",
                                        link.active
                                            ? "bg-primary text-white font-semibold border-primary"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    aria-current={link.active ? "page" : undefined}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    aria-disabled="true"
                                />
                            )
                        )}
                    </nav>
                )}
            </div>
        </BuyerLayout>
    );
}
