// resources/js/Pages/Buyer/Properties/ShowInquiry.jsx
import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import Collapsable from "@/Components/collapsable/collapsable.jsx";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import Stepper from "@/Components/Stepper.jsx";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";

export default function ShowInquiry({
                                        property,
                                        deal,
                                        inquiry,        // from backend (can be null)
                                        steps,          // from backend
                                        visitGate,      // optional time-gating hints
                                        initialFavorites = [],
                                    }) {
    const auth = usePage().props.auth?.user ?? null;
    const cn = (...c) => c.filter(Boolean).join(" ");

    const pages = [
        { name: "Inquiries", href: "/inquiries", current: false },
        { name: property?.title ?? "Property", href: "#", current: true },
    ];

    const isTruthy = (v) => v === true || v === 1 || v === "1";

    const normalized = useMemo(() => {
        const p = property || {};
        return {
            ...p,
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
        };
    }, [property]);

    const {
        price,
        lot_area,
        floor_area,
        sub_type,
        total_rooms,
        car_slots,
        description,
        features,
    } = normalized;

    // favorites
    const [favoriteIds, setFavoriteIds] = useState(
        Array.isArray(initialFavorites) ? initialFavorites : []
    );
    const isFavorite = normalized?.id ? favoriteIds.includes(normalized.id) : false;

    const toggleFavorite = (id) => {
        if (!id) return;
        setFavoriteIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        // Optionally post to server
        // router.post('/favorites/toggle', { property_id: id })
    };

    const shareProperty = async () => {
        const url = `${window.location.origin}/properties/${property?.id}`;
        const title = property?.title || "Property";
        try {
            if (navigator.share) {
                await navigator.share({ title, text: property?.address || "", url });
                return;
            }
        } catch {}
        try {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard");
        } catch {
            prompt("Copy this link:", url);
        }
    };

    // modals / UI
    const [isOpenDealForm, setIsOpenDealForm] = useState(false);
    const [isContactSeller, setIsContactSeller] = useState(false);
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);      // <-- boolean
    const [selectedVisitData, setSelectedVisitData] = useState(null);

    // Step actions
    const actions = {
        inquiry: () => {
            router.post(`/properties/${property.id}/inquiries/resend`);
        },
        appointment: () => {
            if (inquiry?.id) {
                     setSelectedVisitData({
                           property: property,
                           agent: inquiry?.agent ?? null,        // ✅ from single inquiry
                           broker: inquiry?.broker ?? null,      // ✅ from single inquiry
                           inquiryId: inquiry?.id,
                         });
                     setIsAddVisitModal(true);
                     return;
                   }
        },
        offer: () => {
            setIsOpenDealForm(true);
        },
        payment: () => {
            if (deal?.id) router.visit(`/deals/${deal.id}/checkout`);
        },
    };

    // Optional “Next step” hint
    const order = ["inquiry", "appointment", "offer", "payment"];
    const nextKey = order.find(
        (k) => steps?.[k] === "current" || steps?.[k] === "upcoming"
    );

    // Offer time-gating hint
    const isOfferTimeLocked =
        steps?.offer === "locked" &&
        (inquiry?.status || "").toLowerCase() === "accepted" &&
        ["requested", "scheduled"].includes(
            (inquiry?.appointment_status || "none").toLowerCase()
        );

    const offerLockedMsg = isOfferTimeLocked
        ? visitGate?.unlockOn === "end"
            ? "Offer unlocks after the visit ends."
            : "Offer unlocks once your visit starts."
        : undefined;

    console.log(selectedVisitData);

    return (
        <BuyerLayout>
            <DealFormModal
                isOpen={isOpenDealForm}
                setIsOpen={setIsOpenDealForm}
                property={property}
                initialValue={deal}
            />

            {/* Visit scheduler modal */}
            <ScheduleVisitModal
                open={isAddVisitModal}
                setOpen={setIsAddVisitModal}
                visitData={selectedVisitData} // <-- pass selected data, not the whole property
            />

            <div className="mx-4 lg:mx-auto mb-6">
                <Breadcrumb pages={pages} />
            </div>

            {/* Progress Stepper */}
            <div className="mx-4 lg:mx-auto mb-4">
                <Stepper
                    steps={steps}
                    onAction={actions}
                    lockedReasons={{ offer: offerLockedMsg }}
                />

                {offerLockedMsg && visitGate?.visitStart && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {offerLockedMsg}{" "}
                        <span className="ml-1 text-amber-700">
              Scheduled at: {new Date(visitGate.visitStart).toLocaleString()}
            </span>
                    </div>
                )}

                {nextKey && (
                    <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                        Next: {nextKey.charAt(0).toUpperCase() + nextKey.slice(1)}
                    </div>
                )}
            </div>

            <PropertyHeader
                title={normalized.title}
                address={normalized.address}
                isPresell={normalized.isPresell}
            />

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
                            onClick={() => toggleFavorite(property?.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-200 backdrop-blur hover:bg-white"
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-label="Toggle favorite"
                        >
                            <Heart
                                className={cn(
                                    "h-5 w-5",
                                    isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-700"
                                )}
                            />
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
                <Collapsable
                    title="Overview & Actions"
                    description="Price, size and quick actions"
                    defaultOpen
                >
                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <div className="text-3xl font-bold text-green-600">
                                    {price.toLocaleString("en-PH", {
                                        style: "currency",
                                        currency: "PHP",
                                    })}
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                    {lot_area ? `${lot_area} m²` : ""}{" "}
                                    {floor_area ? ` ${floor_area} m²` : ""}
                                </div>
                            </div>

                            {auth?.role === "Buyer" && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={actions.appointment}
                                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        Schedule Tour
                                    </button>

                                    {/* Single Make Offer button, locked by steps.offer */}
                                    {property?.property_listing && (
                                        <PrimaryButton
                                            onClick={() => setIsOpenDealForm(true)}
                                            disabled={steps?.offer === "locked"}
                                            title={
                                                steps?.offer === "locked"
                                                    ? "Offer is locked until the visit requirement is met"
                                                    : deal
                                                        ? "View My Offer"
                                                        : "Make Offer"
                                            }
                                        >
                                            {deal ? "View My Offer" : "Make Offer"}
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
                        <div
                            className="prose max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>
                </Collapsable>

                {/* 3) Features */}
                <Collapsable title="Property Features" defaultOpen={false}>
                    <div className="rounded-xl bg-white">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {features.map((feature, idx) => (
                                <div
                                    key={`${feature?.name}-${idx}`}
                                    className="flex items-center rounded-full bg-green-50 px-4 py-2 text-green-600 hover:shadow"
                                >
                                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                                    <span>{feature?.name ?? "—"}</span>
                                </div>
                            ))}
                            {features.length === 0 && (
                                <p className="text-gray-500">No features listed.</p>
                            )}
                        </div>
                    </div>
                </Collapsable>

                {/* 4) Details */}
                <Collapsable title="Property Details" defaultOpen={false}>
                    <div className="rounded-xl bg-white">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailItem
                                icon={<Building2 className="h-4 w-4" />}
                                label="Property Type"
                                value={property?.property_type ?? "—"}
                            />
                            <DetailItem
                                icon={<Ruler className="h-4 w-4" />}
                                label="Sub Type"
                                value={sub_type}
                            />
                            <DetailItem
                                icon={<DoorClosed className="h-4 w-4" />}
                                label="Total Rooms"
                                value={total_rooms}
                            />
                            <DetailItem
                                icon={<DoorClosed className="h-4 w-4" />}
                                label="Parking Slot"
                                value={car_slots}
                            />
                            <DetailItem
                                icon={<BedDouble className="h-4 w-4" />}
                                label="Total Bedrooms"
                                value={normalized.bedrooms}
                            />
                            <DetailItem
                                icon={<Bath className="h-4 w-4" />}
                                label="Total Bathrooms"
                                value={normalized.bathrooms}
                            />
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
