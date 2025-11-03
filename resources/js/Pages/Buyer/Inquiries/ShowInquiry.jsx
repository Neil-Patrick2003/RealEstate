// resources/js/Pages/Buyer/Properties/ShowInquiry.jsx
import React, { useMemo, useState, useCallback } from "react";
import {usePage, router, Head} from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import {
    CalendarDays,
    Pencil,
    Bed,
    Bath,
    Maximize,
    Ruler,
    MessageSquare,
    MapPin,
    AlertTriangle,
} from "lucide-react";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import Stepper from "@/Components/Stepper.jsx";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import Modal from "@/Components/Modal.jsx";
import ChannelView from "@/Components/Chat/ChannelView.jsx";
import StepperNotes from "@/Components/StepperNotes.jsx";

/* ---------- Small helpers ---------- */
const cx = (...c) => c.filter(Boolean).join(" ");
const peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
});
const safeStr = (v) => (v === 0 || v ? String(v) : "");
const truthy = (v) => v === true || v === 1 || v === "1";

function timeAgo(input) {
    if (!input) return "";
    const d = typeof input === "string" ? new Date(input) : input;
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/** super-light allowlist: if we detect tags outside this list, render as plain text */
const ALLOW_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li", "h4", "h5"];
function looksSafeHtml(html = "") {
    const tags = html.match(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi) || [];
    return tags.every((t) => {
        const name = (t.match(/<\/?([a-z0-9-]+)/i) || [, ""])[1]?.toLowerCase();
        return ALLOW_TAGS.includes(name);
    });
}

/* ---------- Status Badge (flat + legible) ---------- */
function StatusBadge({ phase = "draft" }) {
    const map = {
        pending: "bg-amber-100 text-amber-800",
        draft: "bg-gray-100 text-gray-800",
        sent: "bg-amber-100 text-amber-800", // Using amber for general "sent" state
        countered: "bg-amber-100 text-amber-800",
        accepted: "bg-green-100 text-green-800",
        processing: "bg-purple-100 text-purple-800",
        closed: "bg-emerald-100 text-emerald-800",
        rejected: "bg-rose-100 text-rose-800",
        expired: "bg-zinc-100 text-zinc-800",
        sold: "bg-emerald-100 text-emerald-800",
        terminated: "bg-rose-100 text-rose-800",
    };
    const cls = map[phase] || map.draft;
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
                cls
            )}
            aria-label={`Status: ${phase}`}
        >
      {phase.charAt(0).toUpperCase() + phase.slice(1)}
    </span>
    );
}

/* ---------- Small info row ---------- */
function Row({ label, children }) {
    // Using a light bottom border as a minimal divider
    return (
        <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-b-0">
            <div className="text-xs font-medium text-gray-500">{label}</div>
            <div className="text-sm font-semibold text-gray-900">
                {children ?? "—"}
            </div>
        </div>
    );
}

/* ---------- Deal Details Modal (flat) ---------- */
function DealDetailsModal({
                              open,
                              onClose,
                              deal,
                              listingId,
                              onEdit,
                              onCheckout,
                              onCloseDeal,
                              authId,
                          }) {
    if (!deal) return null;

    const phase = (deal.status || "draft").toLowerCase();
    const updatedAt = deal.updated_at ? new Date(deal.updated_at) : null;

    const lastEditedByYou =
        !!deal.amount_last_updated_by &&
        Number(deal.amount_last_updated_by) === Number(authId);
    const someoneElseEdited =
        !!deal.amount_last_updated_by &&
        Number(deal.amount_last_updated_by) !== Number(authId);
    const isPending = phase === "pending" || phase === "countered";

    const handleStatus = async (next) => {
        const ok = window.confirm(
            next === "Accepted"
                ? "Accept this offer? This will notify the other party and proceed to payment."
                : "Decline this offer? This action cannot be easily undone."
        );
        if (!ok) return;

        try {
            await router.put(
                `/deal/${deal.id}/${next}`,
                { status: next },
                { preserveScroll: true }
            );
            onClose?.();
        } catch (e) {
            alert("Something went wrong updating status.");
        }
    };

    const notesPreview = safeStr(deal.notes).trim();
    const notesShort =
        notesPreview.length > 240
            ? `${notesPreview.slice(0, 240)}…`
            : notesPreview || "—";

    return (
        <Modal show={open} onClose={onClose} maxWidth="lg">
            <div className="relative rounded-2xl bg-white p-6"> {/* Flat: no shadow, no border */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full p-2"
                    aria-label="Close modal"
                    type="button"
                >
                    ✕
                </button>

                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Your Offer</h3>
                        <div className="text-xs text-gray-500 mt-0.5">
                            Review the latest terms of this deal.
                        </div>
                    </div>
                    <StatusBadge phase={phase} />
                </div>

                <div className="rounded-xl bg-amber-50 p-4 mb-5"> {/* Light background for emphasis */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-2xl font-extrabold text-amber-800">
                            {typeof deal.amount === "number" ||
                            /^\d/.test(String(deal.amount))
                                ? peso.format(Number(deal.amount))
                                : "—"}
                        </div>
                        <div className="text-xs font-semibold text-gray-600">
                            Deal #{deal.id}
                        </div>
                    </div>

                    {someoneElseEdited && isPending && (
                        <div className="mb-3 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span>Counter-offer received. Please respond.</span>
                        </div>
                    )}

                    <div className="space-y-1 rounded-lg bg-white p-3"> {/* Pure white background for list */}
                        <Row label="Notes">{notesShort}</Row>
                        <Row label="Listing ID">{listingId || "—"}</Row>
                        <Row label="Last Update">
                            {updatedAt
                                ? `${updatedAt.toLocaleDateString()} (${timeAgo(updatedAt)})`
                                : "—"}
                        </Row>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4"> {/* Minimal top divider */}
                    {lastEditedByYou && isPending && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                            <Pencil className="h-4 w-4" />
                            Revise Offer
                        </button>
                    )}

                    {someoneElseEdited && isPending && (
                        <>
                            <button
                                type="button"
                                onClick={() => handleStatus("Rejected")}
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                title="Decline this counter-offer"
                            >
                                Decline
                            </button>

                            <button
                                type="button"
                                onClick={onEdit}
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                <Pencil className="h-4 w-4" />
                                Counter
                            </button>

                            <PrimaryButton
                                onClick={() => handleStatus("Accepted")}
                                title="Accept this offer"
                                className="px-4 py-2 text-sm font-semibold"
                            >
                                Accept Offer
                            </PrimaryButton>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}

/* ---------- Fact Card (flat + compact) ---------- */
function FactCard({ icon: Icon, label, value }) {
    // Using gray background for a subtle lift without shadow
    return (
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50">
            <Icon className="h-5 w-5 text-amber-700 mb-1" />
            <div className="text-lg font-extrabold text-gray-900">
                {value ?? "—"}
            </div>
            <div className="text-xs text-gray-600 font-medium tracking-tight mt-0.5">
                {label}
            </div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function ShowInquiry({
                                        property,
                                        deal,
                                        inquiry,
                                        steps,
                                        visitGate,
                                        initialFavorites = [],
                                        channel = null,
                                    }) {
    const auth = usePage().props.auth?.user ?? null;

    const normalized = useMemo(() => {
        const p = property || {};
        return {
            ...p,
            id: p?.id ?? null,
            isPresell: truthy(p?.isPresell),
            images: Array.isArray(p?.images) ? p.images : [],
            coordinate: p?.coordinate ?? null,
            price: Number(p?.price ?? 0),
            lot_area: p?.lot_area ?? null,
            floor_area: p?.floor_area ?? null,
            sub_type: p?.sub_type ?? "—",
            total_rooms: p?.total_rooms ?? "—",
            car_slots: p?.car_slots ?? "—",
            description: p?.description ?? "",
            features: Array.isArray(p?.features) ? p.features : [],
            image_url: p?.image_url ?? null,
            title: p?.title ?? "Property",
            address: p?.address ?? "",
            bedrooms: p?.bedrooms ?? "—",
            bathrooms: p?.bathrooms ?? "—",
            property_type: p?.property_type ?? "—",
            property_listing: p?.property_listing ?? null,
        };
    }, [property]);

    const pages = useMemo(
        () => [
            { name: "Inquiries", href: "/inquiries", current: false },
            { name: normalized.title, href: "#", current: true },
        ],
        [normalized.title]
    );




    // Status helpers
    const iStatus = (inquiry?.status || "pending").toLowerCase();
    const apptStatus = useMemo(() => deriveAppointmentStatus(inquiry), [inquiry]);
    const dealStatus = (deal?.status || "draft").toLowerCase();
    const listingId = normalized?.property_listing?.id ?? null;

    // Favorites (kept local)
    const [favoriteIds, setFavoriteIds] = useState(
        Array.isArray(initialFavorites) ? [...new Set(initialFavorites)] : []
    );
    const isFavorite = normalized.id ? favoriteIds.includes(normalized.id) : false;

    const toggleFavorite = useCallback((id) => {
        if (!id) return;
        setFavoriteIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isOpenDealDetails, setIsOpenDealDetails] = useState(false);
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);

    function getLatestTripping(inquiry) {
        const trips = Array.isArray(inquiry?.trippings) ? inquiry.trippings : [];
        if (!trips.length) return null;
        return [...trips].sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime();
            const tb = new Date(b.created_at || 0).getTime();
            return tb - ta || (b.id ?? 0) - (a.id ?? 0);
        })[0];
    }

    const openScheduleModal = useCallback(() => {
        if (!inquiry?.id) return;

        const latest = getLatestTripping(inquiry);
        const isResched = !!latest && ["pending","accepted","scheduled"].includes(String(latest.status || "").toLowerCase());

        setSelectedVisitData({
            /* required context */
            property,
            agent: inquiry?.agent ?? null,
            broker: inquiry?.broker ?? null,
            inquiryId: inquiry?.id,

            /* mode + current tripping details (used by the modal to prefill) */
            mode: isResched ? "reschedule" : "create",
            tripping: latest
                ? {
                    id: latest.id,
                    status: latest.status,
                    visit_date: latest.visit_date,
                    visit_time: latest.visit_time,
                }
                : null,

            /* convenience initial fields (so modal can directly use them) */
            initialDate: latest?.visit_date ?? null,
            initialTime: latest?.visit_time ?? null,
        });

        setIsAddVisitModal(true);
    }, [inquiry?.id, inquiry?.agent, inquiry?.broker, inquiry, property]);


    const cancelVisit = useCallback(() => {
        if (!inquiry?.id) return;
        if (!window.confirm("Cancel this visit?")) return;
        router.post(
            `/inquiries/${inquiry.id}/appointment/cancel`,
            {},
            { preserveScroll: true }
        );
    }, [inquiry?.id]);

    const closeDeal = useCallback(() => {
        if (!deal?.id) return;
        if (!window.confirm("Close this deal?")) return;
        router.post(`/deals/${deal.id}/close`, {}, { preserveScroll: true });
    }, [deal?.id]);

    const actions = {
        inquiry: () => {
            if (!normalized.id) return;
            router.post(
                `/properties/${normalized.id}/inquiries/resend`,
                {},
                { preserveScroll: true }
            );
        },
        appointment: () => {
            if (iStatus !== "accepted") return; // only open when accepted
            openScheduleModal();
        },
        offer: () => {
            if (deal?.id) setIsOpenDealDetails(true);
            else setIsOpenDealForm(true);
        },
        payment: () => {
            if (deal?.id) router.visit(`/deals/${deal.id}/checkout`);
        },
        close: () => closeDeal(),


    };

    /* ---------- Dynamic Step States & Lock Reasons ---------- */
    const stepStates = useMemo(() => {
        // INQUIRY
        const inquiryState =
            iStatus === "accepted"
                ? "complete"
                : iStatus === "pending"
                    ? "current"
                    : "complete"; // treat rejected as complete end-state

        // APPOINTMENT
        let appointmentState = "locked";
        if (iStatus === "accepted") {
            if (apptStatus === "done") appointmentState = "complete";
            else if (["scheduled", "accepted", "pending"].includes(apptStatus))
                appointmentState = "current";
            else appointmentState = "upcoming"; // none/cancelled
        }

        // OFFER
        let offerState = "locked";
        if (apptStatus === "done") {
            if (!deal) offerState = "upcoming";
            else if (["pending", "countered"].includes(dealStatus)) offerState = "current";
            else if (["accepted", "rejected"].includes(dealStatus)) offerState = "complete";
            else offerState = "upcoming";
        }

        // PAYMENT
        let paymentState = "locked";
        if (dealStatus === "accepted") {
            // could be "current" if you want to highlight payment now
            paymentState = "upcoming";
        } else if (dealStatus === "closed") {
            paymentState = "complete";
        }

        return {
            inquiry: inquiryState,
            appointment: appointmentState,
            offer: offerState,
            payment: paymentState,
        };
    }, [iStatus, apptStatus, deal, dealStatus]);

    const lockedReasons = useMemo(() => {
        return {
            inquiry:
                iStatus === "pending"
                    ? "Your inquiry is pending. Once accepted, you can schedule a visit."
                    : undefined,

            appointment:
                iStatus !== "accepted"
                    ? "Appointment unlocks after your inquiry is accepted."
                    : undefined,

            offer:
                apptStatus !== "done"
                    ? "Offer unlocks after your property visit is completed."
                    : undefined,

            payment:
                dealStatus !== "accepted"
                    ? "Payment unlocks after your offer is accepted."
                    : undefined,
        };
    }, [iStatus, apptStatus, dealStatus]);

    const appointmentStatusProp =
        apptStatus === "none" ? "none" : apptStatus; // pass through to Stepper

    const waitingNote =
        iStatus === "pending"
            ? "Waiting for agent approval before proceeding to the next step."
            : null;

    const descHtml =
        normalized.description || "<p>No description provided for this listing.</p>";
    const descIsSafe = looksSafeHtml(descHtml);

    const hasImg = !!normalized.image_url;
    const imgSrc = hasImg ? `/storage/${normalized.image_url}` : null;

    function deriveAppointmentStatus(inquiry) {
        const trips = Array.isArray(inquiry?.trippings) ? inquiry.trippings : [];
        if (!trips.length) return "none";

        // get latest tripping (by created_at; fallback to id)
        const latest = [...trips].sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime();
            const tb = new Date(b.created_at || 0).getTime();
            return tb - ta || (b.id ?? 0) - (a.id ?? 0);
        })[0];

        const s = String(latest?.status || "").toLowerCase();
        if (["pending", "accepted", "scheduled", "cancelled", "done"].includes(s)) return s;
        return "none";
    }

    return (
        <BuyerLayout>

            <Head title={`Inquiry ${inquiry.id}`} />

            {/* Modals */}
            <DealFormModal
                isOpen={isOpenDealForm}
                setIsOpen={setIsOpenDealForm}
                property={property}
                initialValue={deal}
            />
            <DealDetailsModal
                open={isOpenDealDetails}
                onClose={() => setIsOpenDealDetails(false)}
                deal={deal}
                listingId={listingId}
                onEdit={() => {
                    setIsOpenDealDetails(false);
                    setIsOpenDealForm(true);
                }}
                onCheckout={() => deal?.id && router.visit(`/deals/${deal.id}/checkout`)}
                onCloseDeal={closeDeal}
                authId={auth?.id}
            />
            <ScheduleVisitModal
                open={isAddVisitModal}
                setOpen={setIsAddVisitModal}
                visitData={selectedVisitData}
            />

            {/* Breadcrumb */}
            <div className="mx-4 mb-6">
                <Breadcrumb pages={pages} />
            </div>

            {/* Header / Inquiries summary */}
            <header className="mx-4 mb-8">
                <h1 className="sr-only">Inquiry for {normalized.title}</h1>
                <div className="rounded-2xl bg-white p-6"> {/* Flat card: no shadow, no border */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Image */}
                        <div className="md:col-span-4">
                            <div className="overflow-hidden rounded-xl bg-gray-50"> {/* Subtle background for image container */}
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={normalized.title}
                                        className="w-full aspect-video object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full aspect-video grid place-items-center text-sm text-gray-400">
                                        No image available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                                        {normalized.property_type || "Property"}
                                        {normalized?.property_listing?.updated_at && (
                                            <> · Updated {timeAgo(normalized.property_listing.updated_at)}</>
                                        )}
                                    </div>
                                    <h2 className="mt-1 text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                        {normalized.title}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {normalized.address || "—"}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 pt-1">
                                    <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-700">
                                        {peso.format(Number(normalized.price || 0))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">Listed Price</div>
                                </div>
                            </div>

                            {/* Facts */}
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-4">
                                <FactCard icon={Bed} label="Bedrooms" value={normalized.bedrooms} />
                                <FactCard icon={Bath} label="Bathrooms" value={normalized.bathrooms} />
                                <FactCard
                                    icon={Ruler}
                                    label="Lot Area"
                                    value={normalized.lot_area ? `${normalized.lot_area} sqm` : "—"}
                                />
                                <FactCard
                                    icon={Maximize}
                                    label="Floor Area"
                                    value={normalized.floor_area ? `${normalized.floor_area} sqm` : "—"}
                                />
                            </div>

                            {/* Statuses */}
                            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
                                <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    Inquiry: <StatusBadge phase={iStatus} />
                                </div>
                                {dealStatus && (
                                    <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                        Deal: <StatusBadge phase={dealStatus} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area: Stepper & Chat */}
            <div className="mx-4 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Progress (2/3 width on desktop) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="rounded-2xl bg-white p-6"> {/* Flat card: no shadow, no border */}
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                                Inquiry Progress
                            </h3>

                            <Stepper
                                steps={stepStates}
                                appointmentStatus={appointmentStatusProp}
                                onAction={{
                                    inquiry: actions.inquiry,
                                    appointment: actions.appointment,
                                    offer: actions.offer,
                                    payment: actions.payment,
                                }}
                            />

                            <StepperNotes
                                iStatus={iStatus}
                                apptStatus={apptStatus}
                                deal={deal}
                                dealStatus={dealStatus}
                                onResched={openScheduleModal}
                                onSchedule={openScheduleModal}
                                onOffer={() => (deal?.id ? setIsOpenDealDetails(true) : setIsOpenDealForm(true))}
                                onPay={() => deal?.id && router.visit(`/deals/${deal.id}/checkout`)}
                            />


                            {apptStatus === "scheduled" && iStatus === "accepted" && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        onClick={openScheduleModal}
                                        className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        Reschedule Visit
                                    </button>
                                    <button
                                        onClick={cancelVisit}
                                        className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        Cancel Visit
                                    </button>
                                </div>
                            )}

                            {apptStatus === "cancelled" && iStatus === "accepted" && (
                                <div className="mt-6">
                                    <button
                                        onClick={openScheduleModal}
                                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        Schedule Visit Again
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Property Description */}
                        <div className="rounded-2xl bg-white p-6"> {/* Flat card: no shadow, no border */}
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                                Property Description
                            </h3>
                            <div className="text-sm text-gray-700 leading-relaxed">
                                {descIsSafe ? (
                                    <div dangerouslySetInnerHTML={{ __html: descHtml }} />
                                ) : (
                                    <p className="whitespace-pre-wrap">{descHtml}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Direct Messages (1/3 width on desktop) */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white p-6 lg:sticky lg:top-8"> {/* Flat card: no shadow, no border, sticky */}
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-amber-700" />
                                Direct Messages
                            </h3>
                            <div className="pt-1">
                                <ChannelView channel={channel} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </BuyerLayout>
    );
}
