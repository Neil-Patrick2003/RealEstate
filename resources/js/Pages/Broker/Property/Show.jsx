import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { Link, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";

import PropertyHeader from "@/Components/Property/PropertyHeader.jsx";
import MainImage from "@/Components/Property/MainImage.jsx";
import Thumbnail from "@/Components/Property/Thumbnail.jsx";
import Descriptions from "@/Components/Property/Descriptions.jsx";
import AssignedAgents from "@/Components/Property/AssignedAgents.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faLocationDot,
    faPhone,
    faEnvelope,
    faShareNodes,
    faUpRightFromSquare,
    faTag,
    faDoorClosed,
    faBed,
    faBath,
    faCar,
    faRulerCombined,
} from "@fortawesome/free-solid-svg-icons";

export default function Show({ property }) {
    // Normalize structure
    const p = property?.property || {};
    const agents = Array.isArray(property?.agents) ? property.agents : [];
    const broker = property?.broker || null;
    const auth = usePage()?.props?.auth?.user;

    // Normalize presell (supports 0/1/"1"/bool)
    const isPresell =
        typeof p?.isPresell === "boolean"
            ? p.isPresell
            : p?.isPresell === 1 || p?.isPresell === "1";

    const priceText =
        p?.price != null
            ? Number(p.price).toLocaleString("en-PH", {
                style: "currency",
                currency: "PHP",
                maximumFractionDigits: 0,
            })
            : "Price N/A";

    const pages = [
        { name: "Properties", href: "/broker/properties", current: false },
        { name: p?.title || "Property", href: "#", current: true },
    ];

    // First marker → Google Maps directions link
    const destLatLng = useMemo(() => {
        const marker = (p?.coordinate || []).find((c) => c?.type === "marker")?.coordinates;
        if (!marker) return null;

        if (typeof marker?.lat !== "undefined" && typeof marker?.lng !== "undefined") {
            const lat = parseFloat(marker.lat);
            const lng = parseFloat(marker.lng);
            return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
        }
        if (Array.isArray(marker) && marker.length >= 2) {
            const lng = parseFloat(marker[0]);
            const lat = parseFloat(marker[1]);
            return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
        }
        return null;
    }, [p?.coordinate]);

    const gmapsHref = destLatLng
        ? `https://www.google.com/maps/dir/?api=1&destination=${destLatLng[0]},${destLatLng[1]}`
        : p?.address
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`
            : null;

    const shareUrl = p?.id ? `${window.location.origin}/maps/property/${p.id}` : window.location.href;

    const onShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: p?.title || "Property",
                    text: p?.address || "",
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
            }
        } catch {/* noop */}
    };

    // Quick facts pills
    const keyFacts = [
        { icon: faTag, label: isPresell ? "Pre-Selling" : "For Sale" },
        { icon: faDoorClosed, label: p?.total_rooms ? `${p.total_rooms} rooms` : "—" },
        { icon: faBed, label: p?.bedrooms != null ? `${p.bedrooms} beds` : "—" },
        { icon: faBath, label: p?.bathrooms != null ? `${p.bathrooms} baths` : "—" },
        { icon: faCar, label: p?.car_slots != null ? `${p.car_slots} car` : "—" },
        {
            icon: faRulerCombined,
            label:
                p?.lot_area || p?.floor_area
                    ? `${p?.lot_area ? `Lot ${p.lot_area} m²` : ""}${p?.lot_area && p?.floor_area ? " • " : ""}${p?.floor_area ? `Floor ${p.floor_area} m²` : ""}`
                    : "—",
        },
    ];

    // Quick actions contacts: agents if any, else broker if present
    const contacts = agents.length ? agents : broker ? [broker] : [];

    return (
        <BrokerLayout>
            {/* Top crumbs / back */}
            <div className="flex items-center justify-between">
                <Breadcrumb pages={pages} />
                <Link
                    href="/broker/properties"
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 hover:bg-gray-50 transition"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Back to list
                </Link>
            </div>

            {/* Header */}
            <div className="mt-4">
                <PropertyHeader
                    title={p?.title}
                    address={p?.address}
                    isPresell={isPresell}
                />
            </div>

            {/* Main image */}
            <div className="mt-3">
                <MainImage image_url={p?.image_url} title={p?.title} />
            </div>

            {/* Thumbnails */}
            <div className="mt-3">
                <Thumbnail images={Array.isArray(p?.images) ? p.images : []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* LEFT / MAIN */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Price + quick facts */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-2xl font-extrabold text-emerald-700">{priceText}</p>
                                {p?.address && (
                                    <p className="mt-0.5 text-sm text-gray-600">
                                        <FontAwesomeIcon icon={faLocationDot} className="mr-1.5 text-gray-500" />
                                        {p.address}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {keyFacts.map((k, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-700"
                                    >
                    <FontAwesomeIcon icon={k.icon} className="text-gray-500" />
                                        {k.label}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description/specs */}
                    <Descriptions
                        property_type={p?.property_type}
                        sub_type={p?.sub_type}
                        price={p?.price}
                        total_rooms={p?.total_rooms}
                        bedrooms={p?.bedrooms}
                        bathrooms={p?.bathrooms}
                        car_slots={p?.car_slots}
                        features={p?.features}
                        description={p?.description}
                    />

                    {/* Map block */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                            <div className="flex items-center gap-2">
                                {gmapsHref && (
                                    <a
                                        href={gmapsHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 hover:bg-gray-50 transition"
                                    >
                                        <FontAwesomeIcon icon={faUpRightFromSquare} />
                                        Directions
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={onShare}
                                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 hover:bg-gray-50 transition"
                                >
                                    <FontAwesomeIcon icon={faShareNodes} />
                                    Share
                                </button>
                            </div>
                        </div>
                        <PropertyMap coordinates={Array.isArray(p?.coordinate) ? p.coordinate : []} />
                    </div>
                </div>

                {/* RIGHT / RAIL */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Agents list (or empty) */}
                    <AssignedAgents agents={agents} auth={auth} />

                    {/* Quick contact / actions (agents or broker fallback) */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5 sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick actions</h3>

                        <div className="grid grid-cols-2 gap-2">
                            {contacts.map((c, idx) => (
                                <React.Fragment key={idx}>
                                    {c?.contact_number && (
                                        <a
                                            href={`tel:${c.contact_number}`}
                                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 text-sm"
                                        >
                                            <FontAwesomeIcon icon={faPhone} />
                                            Call
                                        </a>
                                    )}
                                    {c?.email && (
                                        <a
                                            href={`mailto:${c.email}?subject=${encodeURIComponent(`Inquiry: ${p?.title || "Property"}`)}`}
                                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 text-sm"
                                        >
                                            <FontAwesomeIcon icon={faEnvelope} />
                                            Email
                                        </a>
                                    )}
                                </React.Fragment>
                            ))}

                            {contacts.length === 0 && (
                                <div className="col-span-2 text-sm text-gray-500">No contact available.</div>
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {gmapsHref && (
                                <a
                                    href={gmapsHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700 text-sm"
                                >
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    Directions
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={onShare}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700 text-sm"
                            >
                                <FontAwesomeIcon icon={faShareNodes} />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </BrokerLayout>
    );
}
