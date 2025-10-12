// resources/js/Pages/Buyer/Properties/ShowInquiry.jsx
import React, { useMemo, useState, useCallback } from "react";
import { usePage, router } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import PropertyHeader from "@/Components/Property/PropertyHeader.jsx";
import MainImage from "@/Components/Property/MainImage.jsx";
import Thumbnail from "@/Components/Property/Thumbnail.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import {
    Heart,
    Share2,
    CalendarDays,
    SendHorizontal,
    Building2,
    Ruler,
    DoorClosed,
    BedDouble,
    Bath,
    BadgeCheck,
    Pencil,
} from "lucide-react";
import Collapsable from "@/Components/collapsable/collapsable.jsx";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import Stepper from "@/Components/Stepper.jsx";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import Modal from "@/Components/Modal.jsx";

/* ---------- Small helpers ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const fmtPHP = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
});
const safeStr = (v) => (v === 0 || v ? String(v) : "");

/* ---------- Status Badge ---------- */
function StatusBadge({ phase = "draft" }) {
    const map = {
        pending: "bg-amber-100 text-amber-700",
        draft: "bg-gray-100 text-gray-700",
        sent: "bg-blue-100 text-blue-700",
        countered: "bg-amber-100 text-amber-700",
        accepted: "bg-green-100 text-green-700",
        processing: "bg-purple-100 text-purple-700",
        closed: "bg-emerald-100 text-emerald-700",
        rejected: "bg-rose-100 text-rose-700",
        expired: "bg-zinc-100 text-zinc-700",
        sold: "bg-emerald-100 text-emerald-700",
        terminated: "bg-rose-100 text-rose-700",
    };
    const cls = map[phase] || map.draft;
    return (
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls)}>
      {phase.charAt(0).toUpperCase() + phase.slice(1)}
    </span>
    );
}

/* ---------- Small info row ---------- */
function Row({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-3 py-1.5">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm text-gray-900">{children ?? "—"}</div>
        </div>
    );
}

/* ---------- Deal Details Modal (buyer-side actions) ---------- */
function DealDetailsModal({
                              open,
                              onClose,
                              deal,
                              listingId,
                              onEdit,       // opens DealFormModal
                              onCheckout,   // go to checkout
                              onCloseDeal,  // close the deal
                              authId,
                          }) {
    if (!deal) return null;


    const phase = (deal.status || "draft").toLowerCase();
    const createdAt = deal.created_at ? new Date(deal.created_at).toLocaleString() : null;
    const updatedAt = deal.updated_at ? new Date(deal.updated_at).toLocaleString() : null;

    const lastEditedByYou =
        !!deal.amount_last_updated_by && Number(deal.amount_last_updated_by) === Number(authId);
    const someoneElseEdited =
        !!deal.amount_last_updated_by && Number(deal.amount_last_updated_by) !== Number(authId);
    const isPending = phase === "pending";

    const handleStatus = async (next) => {
        // Minimal confirm in-modal (no extra imports)
        const ok = window.confirm(
            next === "Accepted"
                ? "Accept this offer? This will notify the other party."
                : "Decline this offer?"
        );
        if (!ok) return;

        try {
            await router.put(`/deal/${deal.id}/${next}`, { status: next }, { preserveScroll: true });
            onClose?.();
        } catch (e) {
            alert("Something went wrong updating status.");
        }
    };

    const counterNow = () => onEdit?.();

    // Compact notes preview (first 240 chars)
    const notesPreview = safeStr(deal.notes).trim();
    const notesShort = notesPreview.length > 240 ? `${notesPreview.slice(0, 240)}…` : notesPreview || "—";

    return (
        <Modal show={open} onClose={onClose} maxWidth="lg">
            <div className="relative rounded-xl bg-white p-6 shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                    aria-label="Close modal"
                    type="button"
                >
                    ✕
                </button>

                <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Offer Details</h3>
                    <StatusBadge phase={phase} />
                </div>
                <div className="mb-4 text-sm text-gray-500">Review your offer and take action.</div>

                <div className="rounded-lg border border-gray-100 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                            {typeof deal.amount === "number" || /^\d/.test(String(deal.amount))
                                ? fmtPHP.format(Number(deal.amount))
                                : "—"}
                        </div>
                    </div>

                    {someoneElseEdited && isPending && (
                        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            The other party updated the last amount. You can counter, accept, or decline.
                        </div>
                    )}

                    <Row label="Notes">{notesShort}</Row>
                    <Row label="Deal ID">#{deal.id}</Row>
                    <Row label="Listing ID">{listingId || "—"}</Row>
                    <Row label="Created">{createdAt || "—"}</Row>
                    <Row label="Updated">{updatedAt || "—"}</Row>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                    {/* If you last edited → Edit only (while pending) */}
                    {lastEditedByYou && isPending && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Offer
                        </button>
                    )}

                    {/* If someone else last edited → Counter + Accept + Decline (while pending) */}
                    {someoneElseEdited && isPending && (
                        <>
                            <button
                                type="button"
                                onClick={counterNow}
                                className="inline-flex items-center gap-2 rounded-md border border-blue-600 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                            >
                                <Pencil className="h-4 w-4" />
                                Counter Offer
                            </button>

                            <PrimaryButton onClick={() => handleStatus("Accepted")} title="Accept this offer">
                                Accept
                            </PrimaryButton>

                            <button
                                type="button"
                                onClick={() => handleStatus("Rejected")}
                                className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                                title="Decline this offer"
                            >
                                Decline
                            </button>
                        </>
                    )}

                </div>
            </div>
        </Modal>
    );
}

/* ---------- Page ---------- */
export default function ShowInquiry({
                                        property,
                                        deal,
                                        inquiry,        // may be null
                                        steps,          // inquiry, appointment, offer, payment, close
                                        visitGate,      // optional hints
                                        initialFavorites = [],
                                    }) {
    const auth = usePage().props.auth?.user ?? null;
    const isTruthy = (v) => v === true || v === 1 || v === "1";


    // Normalize property
    const normalized = useMemo(() => {
        const p = property || {};
        return {
            ...p,
            id: p?.id ?? null,
            isPresell: isTruthy(p?.isPresell),
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


    // Status helpers (frontend-only view)
    const iStatus = (inquiry?.status || "pending").toLowerCase();
    const apptStatus = (inquiry?.appointment_status || "none").toLowerCase();
    const dealStatus = (deal?.status || "draft").toLowerCase();
    const listingId = normalized?.property_listing?.id ?? null;

    // Favorites
    const [favoriteIds, setFavoriteIds] = useState(Array.isArray(initialFavorites) ? initialFavorites : []);
    const isFavorite = normalized.id ? favoriteIds.includes(normalized.id) : false;

    const toggleFavorite = useCallback((id) => {
        if (!id) return;
        setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        // router.post('/favorites/toggle', { property_id: id })
    }, []);

    // Share
    const shareProperty = useCallback(async () => {
        const id = normalized.id;
        if (!id) return;
        const url = `${window.location.origin}/properties/${id}`;
        const title = normalized.title || "Property";
        try {
            if (navigator.share) {
                await navigator.share({ title, text: normalized.address || "", url });
                return;
            }
        } catch {}
        try {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard");
        } catch {
            prompt("Copy this link:", url);
        }
    }, [normalized.id, normalized.title, normalized.address]);

    // Modals
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isOpenDealDetails, setIsOpenDealDetails] = useState(false);
    const [isContactSeller, setIsContactSeller] = useState(false);
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);

    // Appointment actions

    //
    console.log('Inquires');
    console.log(inquiry);
    const openScheduleModal = useCallback(() => {
        if (!inquiry?.id) return;
        setSelectedVisitData({
            property,
            agent: inquiry?.agent ?? null,
            broker: inquiry?.broker ?? null,
            inquiryId: inquiry?.id,
        });
        setIsAddVisitModal(true);
    }, [inquiry?.id, inquiry?.agent, inquiry?.broker, property]);

    const cancelVisit = useCallback(() => {
        if (!inquiry?.id) return;
        router.post(`/inquiries/${inquiry.id}/appointment/cancel`);
    }, [inquiry?.id]);

    const closeDeal = useCallback(() => {
        if (!deal?.id) return;
        router.post(`/deals/${deal.id}/close`);
    }, [deal?.id]);

    // Stepper actions
    const actions = {
        inquiry: () => {
            if (!normalized.id) return;
            router.post(`/properties/${normalized.id}/inquiries/resend`);
        },
        appointment: () => {
            if (iStatus !== "accepted") return;
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

    // Hints / banners
    const waitingNote = iStatus === "pending" ? "Waiting for agent approval before proceeding to the next step." : null;

    const isOfferLocked = steps?.offer === "locked";
    const offerLockedMsg =
        isOfferLocked && iStatus === "accepted" && apptStatus !== "done"
            ? "Offer will unlock after your appointment is completed."
            : undefined;

    const order = ["inquiry", "appointment", "offer", "payment", "close"].filter((k) => steps?.[k]);
    const nextKey = order.find((k) => steps?.[k] === "current" || steps?.[k] === "upcoming");

    return (
        <BuyerLayout>
            {/* Offer Create/Update */}
            <DealFormModal
                isOpen={isOpenDealForm}
                setIsOpen={setIsOpenDealForm}
                property={property}
                initialValue={deal}
            />

            {/* Deal Details (now with Edit vs Counter/Accept/Decline) */}
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

            {/* Visit scheduler */}
            <ScheduleVisitModal open={isAddVisitModal} setOpen={setIsAddVisitModal} visitData={selectedVisitData} />

            <div className="mx-4 lg:mx-auto mb-6">
                <Breadcrumb pages={pages} />
            </div>

            {/* Progress Stepper */}
            <div className="mx-4 lg:mx-auto mb-4">
                <Stepper steps={steps} onAction={actions} lockedReasons={{ offer: offerLockedMsg }} />

                {waitingNote && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {waitingNote}
                    </div>
                )}

                {apptStatus === "scheduled" && iStatus === "accepted" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={openScheduleModal}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <CalendarDays className="h-4 w-4" />
                            Reschedule Visit
                        </button>
                        <button
                            onClick={cancelVisit}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                            Cancel Visit
                        </button>
                    </div>
                )}

                {apptStatus === "cancelled" && iStatus === "accepted" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={openScheduleModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            <CalendarDays className="h-4 w-4" />
                            Schedule Again
                        </button>
                    </div>
                )}

                {offerLockedMsg && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {offerLockedMsg}
                    </div>
                )}

            </div>

            <PropertyHeader title={normalized.title} address={normalized.address} isPresell={normalized.isPresell} />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="relative lg:col-span-2">
                    {/* overlay actions */}
                    <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                        <button
                            onClick={shareProperty}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-200 backdrop-blur hover:bg-white"
                            title="Share"
                            aria-label="Share"
                        >
                            <Share2 className="h-5 w-5 text-gray-700" />
                        </button>

                        <button
                            onClick={() => toggleFavorite(normalized.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-200 backdrop-blur hover:bg-white"
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-label="Toggle favorite"
                            disabled={!normalized.id}
                        >
                            <Heart className={cn("h-5 w-5", isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-700")} />
                        </button>
                    </div>

                    <MainImage image_url={normalized.image_url} title={normalized.title} />
                </div>

                <div className="lg:col-span-1">
                    <Thumbnail images={normalized.images} />
                </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-6">
                {/* 1) Price / CTAs */}
                <Collapsable title="Overview & Actions" description="Price, size and quick actions" defaultOpen>
                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <div className="text-3xl font-bold text-green-600">{fmtPHP.format(normalized.price)}</div>
                                <div className="mt-1 text-sm text-gray-600">
                                    {normalized.lot_area ? `${normalized.lot_area} m²` : ""}
                                    {normalized.floor_area ? ` ${normalized.floor_area} m²` : ""}
                                </div>
                            </div>

                            {auth?.role === "Buyer" && (
                                <div className="flex flex-wrap gap-2">
                                    {/* Schedule */}
                                    <button
                                        onClick={() => (iStatus === "accepted" ? actions.appointment() : null)}
                                        disabled={iStatus !== "accepted"}
                                        className={cn(
                                            "inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors",
                                            iStatus === "accepted"
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        )}
                                        title={iStatus === "accepted" ? "Schedule a property tour" : "Waiting for agent approval"}
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        {apptStatus === "scheduled"
                                            ? "Reschedule Tour"
                                            : apptStatus === "cancelled"
                                                ? "Schedule Again"
                                                : "Schedule Tour"}
                                    </button>

                                    {/* Offer (details or create) */}
                                    {normalized.property_listing && (
                                        <PrimaryButton
                                            onClick={actions.offer}
                                            disabled={steps?.offer === "locked"}
                                            title={
                                                steps?.offer === "locked"
                                                    ? "Offer will unlock after your appointment is completed."
                                                    : deal
                                                        ? "View My Offer"
                                                        : "Make Offer"
                                            }
                                        >
                                            {deal ? "View My Offer" : "Make Offer"}
                                        </PrimaryButton>
                                    )}

                                    {/* Close Deal quick action */}
                                    {dealStatus === "accepted" && (
                                        <PrimaryButton onClick={actions.close} title="Close the deal">
                                            Close Deal
                                        </PrimaryButton>
                                    )}
                                </div>
                            )}

                            {auth?.role === "Agent" && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setIsContactSeller(true)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-accent"
                                    >
                                        <SendHorizontal className="h-4 w-4" />
                                        Send Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Collapsable>

                {/* 2) Description */}
                <Collapsable title="Property Description" defaultOpen={false}>
                    <div className="rounded-xl bg-white">
                        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: normalized.description }} />
                    </div>
                </Collapsable>

                {/* 3) Features */}
                <Collapsable title="Property Features" defaultOpen={false}>
                    <div className="rounded-xl bg-white">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {normalized.features.length > 0 ? (
                                normalized.features.map((feature, idx) => (
                                    <div
                                        key={`${feature?.name ?? "feature"}-${idx}`}
                                        className="flex items-center rounded-full bg-green-50 px-4 py-2 text-green-600 hover:shadow"
                                    >
                                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                                        <span>{feature?.name ?? "—"}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No features listed.</p>
                            )}
                        </div>
                    </div>
                </Collapsable>

                {/* 4) Details */}
                <Collapsable title="Property Details" defaultOpen={false}>
                    <div className="rounded-xl bg-white">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailItem icon={<Building2 className="h-4 w-4" />} label="Property Type" value={normalized.property_type} />
                            <DetailItem icon={<Ruler className="h-4 w-4" />} label="Sub Type" value={normalized.sub_type} />
                            <DetailItem icon={<DoorClosed className="h-4 w-4" />} label="Total Rooms" value={normalized.total_rooms} />
                            <DetailItem icon={<DoorClosed className="h-4 w-4" />} label="Parking Slot" value={normalized.car_slots} />
                            <DetailItem icon={<BedDouble className="h-4 w-4" />} label="Total Bedrooms" value={normalized.bedrooms} />
                            <DetailItem icon={<Bath className="h-4 w-4" />} label="Total Bathrooms" value={normalized.bathrooms} />
                        </div>
                    </div>
                </Collapsable>

                {/* 5) Map */}
                <Collapsable title="Map & Location" defaultOpen={false}>
                    <div className="rounded-xl bg-white">
                        <PropertyMap coordinates={normalized.coordinate} />
                    </div>
                </Collapsable>
            </div>
        </BuyerLayout>
    );
}

/** Small detail row */
function DetailItem({ icon, label, value }) {
    return (
        <div className="flex items-start">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                {icon}
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">{label}</h3>
                <p className="text-sm text-gray-900">{value}</p>
            </div>
        </div>
    );
}
