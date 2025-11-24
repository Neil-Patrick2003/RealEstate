// resources/js/Pages/Buyer/Properties/ShowInquiry.jsx
import React, { useMemo, useState, useCallback } from "react";
import { usePage, router, Head } from "@inertiajs/react";
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
    User,
    Heart,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import Stepper from "@/Components/Stepper.jsx";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import Modal from "@/Components/Modal.jsx";
import ChannelView from "@/Components/Chat/ChannelView.jsx";
import StepperNotes from "@/Components/StepperNotes.jsx";
import { motion, AnimatePresence } from "framer-motion";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

/* ---------- Professional Utils ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");
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
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
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

/* ---------- Professional Status Badge ---------- */
function StatusBadge({ phase = "draft" }) {
    const variantMap = {
        pending: "warning",
        draft: "secondary",
        sent: "primary",
        countered: "primary",
        accepted: "success",
        processing: "primary",
        closed: "success",
        rejected: "error",
        expired: "secondary",
        sold: "success",
        terminated: "error",
        completed: "success",
        declined: "error",
    };

    const variant = variantMap[phase] || "secondary";

    return (
        <span className={`badge badge-${variant} text-xs sm:text-sm`}>
            {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </span>
    );
}

/* ---------- Professional Info Row ---------- */
function Row({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-b-0">
            <div className="text-sm font-medium text-gray-600">{label}</div>
            <div className="text-sm font-semibold text-gray-900 text-right">{children ?? "—"}</div>
        </div>
    );
}

/* ---------- Mobile-Optimized Deal Details Modal ---------- */
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
    const notesPreview = safeStr(deal.notes).trim();
    const notesShort = notesPreview.length > 240 ? `${notesPreview.slice(0, 240)}…` : notesPreview || "—";

    const lastEditedByYou = deal.amount_last_updated_by && Number(deal.amount_last_updated_by) === Number(authId);
    const someoneElseEdited = deal.amount_last_updated_by && Number(deal.amount_last_updated_by) !== Number(authId);
    const isPending = ["pending", "countered"].includes(phase);

    const handleStatus = async (next) => {
        const ok = window.confirm(
            next === "accepted"
                ? "Accept this offer? This will notify the other party and proceed to payment."
                : "Decline this offer? This action cannot be easily undone."
        );
        if (!ok) return;

        try {
            await router.put(`/deals/${deal.id}`, { status: next }, { preserveScroll: true });
            onClose?.();
        } catch (e) {
            alert("Something went wrong updating status.");
        }
    };

    return (
        <Modal show={open} onClose={onClose} maxWidth="lg">
            <div className="card p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Deal Details</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Review and manage your property offer</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-ghost p-2 rounded-full"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Deal Information */}
                <div className="glass-card p-4 sm:p-5 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                        <div>
                            <div className="text-sm font-medium text-primary-700 mb-1">Offer Amount</div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {deal.amount ? peso.format(Number(deal.amount)) : "—"}
                            </div>
                        </div>
                        <div className="text-right">
                            <StatusBadge phase={phase} />
                            <div className="text-xs text-gray-500 mt-1">Deal #{deal.id}</div>
                        </div>
                    </div>

                    {/* Counter-offer Alert */}
                    {someoneElseEdited && isPending && (
                        <div className="alert alert-warning mb-4 text-sm">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">
                                    Counter-offer received. Please respond.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Deal Details */}
                    <div className="card-flat p-3 sm:p-4">
                        <Row label="Notes">
                            <span className="text-gray-700 text-sm">{notesShort}</span>
                        </Row>
                        <Row label="Listing ID">{listingId || "—"}</Row>
                        <Row label="Last Updated">
                            {updatedAt ? (
                                <div className="text-right">
                                    <div className="text-sm">{updatedAt.toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">{timeAgo(updatedAt)}</div>
                                </div>
                            ) : "—"}
                        </Row>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-end border-t border-gray-100 pt-4">
                    {lastEditedByYou && isPending && (
                        <button
                            onClick={onEdit}
                            className="btn-outline text-sm"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Revise Offer
                        </button>
                    )}

                    {someoneElseEdited && isPending && (
                        <>
                            <button
                                onClick={() => handleStatus("rejected")}
                                className="btn-outline text-rose-600 border-rose-200 hover:bg-rose-50 text-sm order-3 sm:order-1"
                            >
                                Decline
                            </button>
                            <button
                                onClick={onEdit}
                                className="btn-outline text-amber-600 border-amber-200 hover:bg-amber-50 text-sm order-2 sm:order-2"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Counter Offer
                            </button>
                            <PrimaryButton
                                onClick={() => handleStatus("accepted")}
                                className="order-1 sm:order-3 text-sm"
                            >
                                Accept Offer
                            </PrimaryButton>
                        </>
                    )}

                    {phase === "accepted" && (
                        <PrimaryButton
                            onClick={onCheckout}
                            className="text-sm"
                        >
                            Proceed to Payment haha
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </Modal>
    );
}

/* ---------- Mobile-Optimized Fact Card ---------- */
function FactCard({ icon: Icon, label, value }) {
    return (
        <div className="card-flat p-3 sm:p-4 text-center">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mb-1 sm:mb-2 mx-auto" />
            <div className="text-base sm:text-lg font-bold text-gray-900">{value ?? "—"}</div>
            <div className="text-xs text-gray-600 font-medium mt-1">{label}</div>
        </div>
    );
}

/* ---------- Mobile-Optimized Favorite Button ---------- */
function FavoriteButton({ isFavorite, onClick, propertyId }) {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(propertyId);
    };

    return (
        <button
            onClick={handleClick}
            className={`btn-ghost p-2 rounded-full ${
                isFavorite ? 'text-rose-500 hover:text-rose-600' : 'text-gray-600 hover:text-gray-700'
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
    );
}

/* ---------- Mobile Property Facts Section ---------- */
function MobilePropertyFacts({ property }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="lg:hidden">
            <div className="card p-4">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900">Property Facts</h3>
                    {expanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <FactCard icon={Bed} label="Bedrooms" value={property.bedrooms} />
                                <FactCard icon={Bath} label="Bathrooms" value={property.bathrooms} />
                                <FactCard icon={Ruler} label="Lot Area" value={property.lot_area ? `${property.lot_area} sqm` : "—"} />
                                <FactCard icon={Maximize} label="Floor Area" value={property.floor_area ? `${property.floor_area} sqm` : "—"} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ---------- Page Component ---------- */
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
            { name: "Properties", href: "/properties", current: false },
            { name: "My Inquiries", href: "/inquiries", current: false },
            { name: normalized.title, href: "#", current: true },
        ],
        [normalized.title]
    );

    // Favorite state management
    const [favoriteIds, setFavoriteIds] = useState(
        Array.isArray(initialFavorites) ? [...new Set(initialFavorites)] : []
    );
    const isFavorite = normalized.id ? favoriteIds.includes(normalized.id) : false;

    const toggleFavorite = useCallback((propertyId) => {
        if (!propertyId) return;

        const newFavorites = favoriteIds.includes(propertyId)
            ? favoriteIds.filter(id => id !== propertyId)
            : [...favoriteIds, propertyId];

        setFavoriteIds(newFavorites);

        // Sync with server
        router.post(
            `/properties/${propertyId}/favorites`,
            {},
            {
                preserveScroll: true,
                onError: () => {
                    // Revert on error
                    setFavoriteIds(favoriteIds);
                },
            }
        );
    }, [favoriteIds]);

    // Modal states
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isOpenDealDetails, setIsOpenDealDetails] = useState(false);
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);

    // Status helpers
    const iStatus = (inquiry?.status || "pending").toLowerCase();
    const dealStatus = (deal?.status || "draft").toLowerCase();
    const listingId = normalized?.property_listing?.id ?? null;

    // Appointment status logic
    const deriveAppointmentStatus = useCallback((inq) => {
        const trips = Array.isArray(inq?.trippings) ? inq.trippings : [];
        if (!trips.length) return "none";

        const latest = [...trips].sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime();
            const tb = new Date(b.created_at || 0).getTime();
            return tb - ta || (b.id ?? 0) - (a.id ?? 0);
        })[0];

        const s = String(latest?.status || "").toLowerCase();
        return ["pending", "accepted", "completed", "declined"].includes(s) ? s : "none";
    }, []);

    const apptStatus = useMemo(() => deriveAppointmentStatus(inquiry), [inquiry, deriveAppointmentStatus]);

    // Get latest tripping
    const getLatestTripping = useCallback((inq) => {
        const trips = Array.isArray(inq?.trippings) ? inq.trippings : [];
        if (!trips.length) return null;
        return [...trips].sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime();
            const tb = new Date(b.created_at || 0).getTime();
            return tb - ta || (b.id ?? 0) - (a.id ?? 0);
        })[0];
    }, []);

    // Schedule visit handler
    const openScheduleModal = useCallback(() => {
        if (!inquiry?.id) return;

        const latest = getLatestTripping(inquiry);
        const isResched = !!latest && ["pending", "accepted"].includes(String(latest.status || "").toLowerCase());

        setSelectedVisitData({
            property: normalized,
            agent: inquiry?.agent ?? null,
            broker: inquiry?.broker ?? null,
            inquiryId: inquiry?.id,
            mode: isResched ? "reschedule" : "create",
            tripping: latest ? {
                id: latest.id,
                status: latest.status,
                visit_date: latest.visit_date,
                visit_time: latest.visit_time,
            } : null,
            initialDate: latest?.visit_date ?? null,
            initialTime: latest?.visit_time ?? null,
        });

        setIsAddVisitModal(true);
    }, [inquiry, normalized, getLatestTripping]);

    // Action handlers
    const cancelVisit = useCallback(() => {
        if (!inquiry?.id || !window.confirm("Are you sure you want to cancel this visit?")) return;
        router.post(`/inquiries/${inquiry.id}/appointment/cancel`, {}, { preserveScroll: true });
    }, [inquiry?.id]);

    const closeDeal = useCallback(() => {
        if (!deal?.id || !window.confirm("Are you sure you want to close this deal?")) return;
        router.post(`/deals/${deal.id}/close`, {}, { preserveScroll: true });
    }, [deal?.id]);

    // Action mappings
    const actions = {
        inquiry: () => {
            if (!normalized.id) return;
            router.post(`/properties/${normalized.id}/inquiries/resend`, {}, { preserveScroll: true });
        },
        appointment: () => {
            if (iStatus !== "accepted") return;
            openScheduleModal();
        },
        offer: () => {
            deal?.id ? setIsOpenDealDetails(true) : setIsOpenDealForm(true);
        },
        payment: () => {
            if (deal?.id) router.visit(`/deals/${deal.id}/checkout`);
        },
        close: closeDeal,
    };

    // Step states
    const stepStates = useMemo(() => {
        const inquiryState = iStatus === "accepted" ? "complete" : iStatus === "pending" ? "current" : "complete";

        let appointmentState = "locked";
        if (iStatus === "accepted") {
            if (apptStatus === "completed") appointmentState = "complete";
            else if (["pending", "accepted"].includes(apptStatus)) appointmentState = "current";
            else appointmentState = "upcoming";
        }

        let offerState = "locked";
        if (apptStatus === "completed") {
            if (!deal) offerState = "upcoming";
            else if (["pending", "countered"].includes(dealStatus)) offerState = "current";
            else if (["accepted", "rejected", "closed"].includes(dealStatus)) offerState = "complete";
            else offerState = "upcoming";
        }

        let paymentState = "locked";
        if (dealStatus === "accepted") paymentState = "upcoming";
        else if (dealStatus === "closed") paymentState = "complete";

        return { inquiry: inquiryState, appointment: appointmentState, offer: offerState, payment: paymentState };
    }, [iStatus, apptStatus, deal, dealStatus]);

    const lockedReasons = useMemo(() => ({
        inquiry: iStatus === "pending" ? "Your inquiry is pending. Once accepted, you can schedule a visit." : undefined,
        appointment: iStatus !== "accepted" ? "Appointment unlocks after your inquiry is accepted." : undefined,
        offer: apptStatus !== "completed" ? "Offer unlocks only after your visit is completed." : undefined,
        payment: dealStatus !== "accepted" ? "Payment unlocks after your offer is accepted." : undefined,
    }), [iStatus, apptStatus, dealStatus]);

    // Content rendering
    const descHtml = normalized.description || "<p>No description provided.</p>";
    const descIsSafe = looksSafeHtml(descHtml);
    const imgSrc = normalized.image_url ? `/storage/${normalized.image_url}` : null;

    return (
        <AuthenticatedLayout>
            <Head title={`Inquiry - ${normalized.title}`} />

            {/* Modals */}
            <DealFormModal
                isOpen={isOpenDealForm}
                setIsOpen={setIsOpenDealForm}
                property={normalized}
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

            <div className="page-container">
                <div className="page-content">
                    {/* Breadcrumb */}
                    <div className="mb-6 sm:mb-8">
                        <Breadcrumb pages={pages} />
                    </div>

                    {/* Property Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="card p-4 sm:p-6">
                            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
                                {/* Property Image */}
                                <div className="lg:col-span-5">
                                    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-inner">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={normalized.title}
                                                className="w-full h-full object-cover property-card-image"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-property.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <div className="text-center">
                                                    <MapPin className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2" />
                                                    <div className="text-sm">No image available</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                                            <FavoriteButton
                                                isFavorite={isFavorite}
                                                onClick={toggleFavorite}
                                                propertyId={normalized.id}
                                            />
                                        </div>
                                        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 badge-primary text-base sm:text-lg font-bold">
                                            {peso.format(normalized.price)}
                                        </div>
                                    </div>
                                </div>

                                {/* Property Details */}
                                <div className="lg:col-span-7">
                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                        <div className="flex-1">
                                            <div className="text-xs sm:text-sm font-semibold text-primary-600 uppercase tracking-wide mb-1">
                                                {normalized.property_type}
                                            </div>
                                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                                {normalized.title}
                                            </h1>
                                            <div className="flex items-center gap-2 text-gray-600 mb-3 sm:mb-4">
                                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                                <span className="text-xs sm:text-sm">{normalized.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Property Facts */}
                                    <div className="hidden lg:grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 sm:mb-6">
                                        <FactCard icon={Bed} label="Bedrooms" value={normalized.bedrooms} />
                                        <FactCard icon={Bath} label="Bathrooms" value={normalized.bathrooms} />
                                        <FactCard icon={Ruler} label="Lot Area" value={normalized.lot_area ? `${normalized.lot_area} sqm` : "—"} />
                                        <FactCard icon={Maximize} label="Floor Area" value={normalized.floor_area ? `${normalized.floor_area} sqm` : "—"} />
                                    </div>

                                    {/* Status Overview */}
                                    <div className="glass-card p-3 sm:p-4">
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                                <span className="text-xs sm:text-sm font-medium text-gray-700">Inquiry:</span>
                                                <StatusBadge phase={iStatus} />
                                            </div>
                                            {apptStatus !== "none" && (
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Visit:</span>
                                                    <StatusBadge phase={apptStatus} />
                                                </div>
                                            )}
                                            {deal && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Deal:</span>
                                                    <StatusBadge phase={dealStatus} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Property Facts */}
                    <MobilePropertyFacts property={normalized} />

                    {/* Main Content */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
                            {/* Left Column - Progress & Details */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                {/* Progress Stepper */}
                                <div className="card p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Inquiry Progress</h2>

                                    <Stepper
                                        steps={stepStates}
                                        appointmentStatus={apptStatus === "none" ? "none" : apptStatus}
                                        onAction={actions}
                                        lockedReasons={lockedReasons}
                                    />

                                    <StepperNotes
                                        iStatus={iStatus}
                                        apptStatus={apptStatus}
                                        deal={deal}
                                        dealStatus={dealStatus}
                                        onResched={openScheduleModal}
                                        onSchedule={openScheduleModal}
                                        onOffer={actions.offer}
                                        onPay={actions.payment}
                                    />

                                    {/* Visit Actions */}
                                    {iStatus === "accepted" && (
                                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            {apptStatus === "accepted" && (
                                                <>
                                                    <button
                                                        onClick={openScheduleModal}
                                                        className="btn-outline text-sm"
                                                    >
                                                        <CalendarDays className="h-4 w-4 mr-2" />
                                                        Reschedule Visit
                                                    </button>
                                                    <button
                                                        onClick={cancelVisit}
                                                        className="btn-secondary text-sm"
                                                    >
                                                        Cancel Visit
                                                    </button>
                                                </>
                                            )}
                                            {apptStatus === "declined" && (
                                                <button
                                                    onClick={openScheduleModal}
                                                    className="btn-primary text-sm"
                                                >
                                                    <CalendarDays className="h-4 w-4 mr-2" />
                                                    Schedule New Visit
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Property Description */}
                                <div className="card p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Property Details</h3>
                                    <div className="prose prose-sm max-w-none text-gray-700 text-sm sm:text-base">
                                        {descIsSafe ? (
                                            <div dangerouslySetInnerHTML={{ __html: descHtml }} />
                                        ) : (
                                            <div className="whitespace-pre-wrap">{descHtml}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Chat */}
                            <div className="lg:col-span-1">
                                <div className="card p-4 sm:p-6 lg:sticky lg:top-4">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Direct Messages</h3>
                                    </div>
                                    <div className="h-64 sm:h-80 lg:h-96">
                                        <ChannelView channel={channel} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
