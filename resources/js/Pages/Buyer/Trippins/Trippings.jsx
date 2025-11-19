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
    faCalendarDays,
    faMapPin,
    faBuilding,
    faUser,
    faMessage,
    faEye,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import { Head, Link, router } from "@inertiajs/react";
import ResponsiveHoverDialog from "@/Components/HoverDialog.jsx";
import { StarIcon } from "@heroicons/react/24/solid";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

dayjs.extend(relativeTime);

/* ---------- Professional Utils ---------- */
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

const statusConfig = {
    accepted: {
        label: "Confirmed",
        variant: "success",
        icon: faCheck,
        description: "Visit has been confirmed"
    },
    pending: {
        label: "Pending",
        variant: "warning",
        icon: faClock,
        description: "Waiting for confirmation"
    },
    rejected: {
        label: "Declined",
        variant: "error",
        icon: faTrashAlt,
        description: "Visit was declined"
    },
    cancelled: {
        label: "Cancelled",
        variant: "secondary",
        icon: faCalendarDays,
        description: "Visit was cancelled"
    },
    completed: {
        label: "Completed",
        variant: "primary",
        icon: faCheck,
        description: "Visit completed successfully"
    },
    default: {
        label: "Scheduled",
        variant: "primary",
        icon: faCalendarCheck,
        description: "Visit is scheduled"
    }
};

const StatusBadge = ({ status, size = "medium" }) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.default;

    const sizeClasses = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base"
    };

    const variantClasses = {
        primary: "badge-primary",
        secondary: "badge-secondary",
        success: "badge-success",
        warning: "badge-warning",
        error: "badge-error"
    };

    return (
        <div className={`badge ${sizeClasses[size]} ${variantClasses[config.variant]} gap-2`}>
            <FontAwesomeIcon icon={config.icon} className="w-3 h-3" />
            {config.label}
        </div>
    );
};

const timeBadge = (tripDate) => {
    if (!tripDate?.isValid?.()) return null;
    const now = dayjs();
    if (tripDate.isSame(now, "day")) return { label: "Today", cls: "badge-primary" };
    if (tripDate.isAfter(now, "day")) return { label: "Upcoming", cls: "badge-accent" };
    return { label: "Past", cls: "badge-gray" };
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

/* ---------- Professional Components ---------- */
function PageHeader({ title, subtitle, action }) {
    return (
        <div className="page-header">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">{title}</h1>
                    {subtitle && (
                        <p className="section-description">{subtitle}</p>
                    )}
                </div>
                {action && (
                    <div className="flex items-center gap-3">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatsCard({ title, value, trend, icon, color = "primary" }) {
    const colorClasses = {
        primary: "bg-primary-50 text-primary-600",
        accent: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        secondary: "bg-gray-50 text-gray-600"
    };

    return (
        <div className="card-hover p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-1 ${
                            trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                            {trend.value} {trend.direction === 'up' ? '↗' : '↘'}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

function ContactCard({ contact, trip, onCopy, copiedId }) {
    const { rating, reviews } = useMemo(() => {
        const feedbacks = contact?.feedback_received || contact?.feedback_as_receiver || [];
        const avgRating = feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
            : null;
        return { rating: avgRating, reviews: feedbacks.length };
    }, [contact]);

    if (!contact) return null;

    const formatRating = (n) => (n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(1));

    return (
        <div className="card p-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="avatar-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    {contact?.name ? contact.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                    <h6>{contact.name}</h6>
                    <p className="text-xs text-gray-500 mt-1">Real Estate Agent</p>

                    {/* Rating Display */}
                    <div className="flex items-center gap-1 mt-2">
                        {rating != null ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`h-3 w-3 ${
                                            i < Math.round(rating) ? "text-amber-400" : "text-gray-300"
                                        }`}
                                    />
                                ))}
                                <span className="text-xs font-semibold text-gray-700 ml-1">
                                    {formatRating(rating)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    ({reviews})
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-500">No ratings yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                {contact?.contact_number && (
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{contact.contact_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <a
                                href={`tel:${contact.contact_number}`}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Copy
                            </a>
                            <button
                                type="button"
                                onClick={() => onCopy(contact.contact_number, `num-${trip.id}`)}
                                className="btn-ghost p-1 text-xs"
                                title="Copy number"
                            >
                                <FontAwesomeIcon
                                    icon={copiedId === `num-${trip.id}` ? faCheck : faCopy}
                                    className={cn(
                                        "w-3 h-3",
                                        copiedId === `num-${trip.id}` ? "text-emerald-600" : "text-gray-500"
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                )}
                {contact?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-gray-400" />
                        <a href={`mailto:${contact.email}`} className="text-primary-600 hover:text-primary-700 text-xs">
                            {contact.email}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

function TripActions({ trip, onReschedule, onCancel, onMessage, contact }) {
    const now = dayjs();
    const tripDate = dayjs(trip.visit_date);
    const isFuture = tripDate.isAfter(now, "day");
    const isToday = tripDate.isSame(now, "day");
    const isPast = tripDate.isBefore(now, "day");
    const status = trip?.status ?? "pending";

    const viewHref = `/properties/${trip?.property?.id}`;

    return (
        <div className="space-y-3">
            {/* Primary action */}
            {status.toLowerCase() === "accepted" && (isFuture || isToday) ? (
                <Link
                    href={viewHref}
                    className="btn-primary w-full text-sm"
                >
                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                    View Property
                </Link>
            ) : status.toLowerCase() === "accepted" && isPast ? (
                <button
                    onClick={() => onReschedule(trip)}
                    className="btn-outline w-full text-sm"
                >
                    <FontAwesomeIcon icon={faRedo} className="mr-2" />
                    Reschedule Visit
                </button>
            ) : (
                <button
                    onClick={() => onReschedule(trip)}
                    className="btn-primary w-full text-sm"
                >
                    <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                    Reschedule
                </button>
            )}

            {/* Cancel */}
            <button
                onClick={() => onCancel(trip)}
                className="btn-outline w-full text-sm text-rose-600 border-rose-200 hover:bg-rose-50"
            >
                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                Cancel Visit
            </button>
        </div>
    );
}

export default function Trippings({ trippings }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const list = useMemo(() => {
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
            if (selectedVisit?.cancel_url) {
                await router.visit(selectedVisit.cancel_url, {
                    method: "post",
                    preserveScroll: true,
                    preserveState: true,
                });
            } else if (selectedVisit?.id) {
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

    // Calculate stats
    const stats = useMemo(() => {
        const now = dayjs();
        return {
            total: list.length,
            upcoming: list.filter(t => dayjs(t.visit_date).isAfter(now, 'day')).length,
            today: list.filter(t => dayjs(t.visit_date).isSame(now, 'day')).length,
            past: list.filter(t => dayjs(t.visit_date).isBefore(now, 'day')).length
        };
    }, [list]);

    return (
        <AuthenticatedLayout>
            <Head title="Scheduled Visits" />

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

            <div className="page-container">
                <div className="page-content">
                    {/* Header */}
                    <PageHeader
                        title="Scheduled Visits"
                        subtitle="Manage your property visits, communicate with agents, and track your viewing schedule"
                        action={
                            <Link
                                href="/properties"
                                className="btn-primary"
                            >
                                <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
                                Browse Properties
                            </Link>
                        }
                    />

                    {/* Stats Overview */}
                    <div className="grid-cards mb-8">
                        <StatsCard
                            title="Total Visits"
                            value={stats.total}
                            icon={faCalendarDays}
                            color="primary"
                        />
                        <StatsCard
                            title="Upcoming"
                            value={stats.upcoming}
                            icon={faClock}
                            color="accent"
                        />
                        <StatsCard
                            title="Today"
                            value={stats.today}
                            icon={faCalendarCheck}
                            color="warning"
                        />
                        <StatsCard
                            title="Completed"
                            value={stats.past}
                            icon={faCheck}
                            color="secondary"
                        />
                    </div>

                    {/* Visits List */}
                    {list.length === 0 ? (
                        <div className="card text-center p-12 animate-fade-in">
                            <div className="avatar-lg mx-auto mb-6 bg-gray-100">
                                <FontAwesomeIcon icon={faCalendarPlus} className="text-2xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No visits scheduled</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                When you schedule a property visit, you'll see it here with all the details and contact information.
                            </p>
                            <Link
                                href="/properties"
                                className="btn-primary"
                            >
                                <FontAwesomeIcon icon={faExpand} className="mr-2" />
                                Browse Properties
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {list.map((trip) => {
                                const now = dayjs();
                                const tripDate = dayjs(trip.visit_date);
                                const contact = getPrimaryContact(trip);

                                const tb = timeBadge(tripDate);
                                const whenRel = tripDate.isValid() ?
                                    (tripDate.isAfter(now) ? `in ${tripDate.fromNow(true)}` : `${tripDate.fromNow()}`) : null;

                                const timeDisplay = (() => {
                                    const t = trip?.visit_time ? dayjs(`1970-01-01T${trip.visit_time}`) : null;
                                    return t?.isValid?.() ? t.format("hh:mm A") : "—";
                                })();

                                const viewHref = `/properties/${trip?.property?.id}`;
                                const imageSrc = trip?.property?.image_url || trip?.property?.thumbnail_url;
                                const status = trip?.status ?? "pending";

                                return (
                                    <article key={trip.id} className="card-hover animate-fade-in">
                                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            {/* Image */}
                                            <div className="lg:col-span-3">
                                                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-inner">
                                                    <Link href={viewHref}>
                                                        <SafeImg
                                                            src={imageSrc}
                                                            alt={trip?.property?.title}
                                                            className="property-card-image"
                                                        />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="lg:col-span-6 flex flex-col">
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                            {trip?.property?.title ?? "Untitled Property"}
                                                        </h3>
                                                        <p className="text-gray-600 flex items-center gap-2 mb-1">
                                                            <FontAwesomeIcon icon={faMapPin} className="text-gray-400" />
                                                            {trip?.property?.address ?? "Address not provided"}
                                                        </p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                                                            {(trip?.property?.property_type ?? "—")}
                                                            {trip?.property?.sub_type ? ` • ${trip.property.sub_type}` : ""}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {tb && <span className={cn("badge", tb.cls)}>{tb.label}</span>}
                                                        <StatusBadge status={status} />
                                                    </div>
                                                </div>

                                                {/* Visit Details */}
                                                <div className="glass-card p-4 mb-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <FontAwesomeIcon icon={faCalendarCheck} className="text-primary-600" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    {tripDate?.isValid?.() ? tripDate.format("MMMM D, YYYY") : "—"}
                                                                </div>
                                                                {whenRel && (
                                                                    <div className="text-xs text-gray-500">{whenRel}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <FontAwesomeIcon icon={faClock} className="text-primary-600" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">{timeDisplay}</div>
                                                                <div className="text-xs text-gray-500">Scheduled Time</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {trip?.notes && (
                                                    <div className="card-flat p-4 mb-4">
                                                        <div className="flex items-start gap-3 text-sm text-gray-700">
                                                            <FontAwesomeIcon icon={faCommentDots} className="text-primary-600 mt-0.5" />
                                                            <div>
                                                                <strong className="font-medium text-gray-900">Visit Notes:</strong>
                                                                <p className="mt-1">{trip.notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-500 mt-auto">
                                                    Scheduled {trip?.created_at ? dayjs(trip.created_at).fromNow() : "—"}
                                                </p>
                                            </div>

                                            {/* Contact + Actions */}
                                            <div className="lg:col-span-3 space-y-4">
                                                <ContactCard
                                                    contact={contact}
                                                    trip={trip}
                                                    onCopy={copyToClipboard}
                                                    copiedId={copiedId}
                                                />
                                                <TripActions
                                                    trip={trip}
                                                    onReschedule={openScheduleModal}
                                                    onCancel={(trip) => {
                                                        setSelectedVisit(trip);
                                                        setOpenCancelModal(true);
                                                    }}
                                                    onMessage={() => {}}
                                                    contact={contact}
                                                />
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {links?.length > 0 && (
                        <nav className="flex flex-wrap gap-2 mt-8 justify-end" aria-label="Pagination">
                            {links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveScroll
                                        className={cn(
                                            "btn-outline text-sm",
                                            link.active ? "btn-primary" : ""
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-current={link.active ? "page" : undefined}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="btn-outline text-sm opacity-50 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-disabled="true"
                                    />
                                )
                            )}
                        </nav>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
