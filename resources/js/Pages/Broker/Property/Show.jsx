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
    faEdit,
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
                // You might want to show a toast notification here
            }
        } catch {/* noop */}
    };

    // Quick facts pills
    const keyFacts = [
        { icon: faTag, label: isPresell ? "Pre-Selling" : "For Sale", type: "status" },
        { icon: faDoorClosed, label: p?.total_rooms ? `${p.total_rooms} rooms` : "—", type: "rooms" },
        { icon: faBed, label: p?.bedrooms != null ? `${p.bedrooms} beds` : "—", type: "beds" },
        { icon: faBath, label: p?.bathrooms != null ? `${p.bathrooms} baths` : "—", type: "baths" },
        { icon: faCar, label: p?.car_slots != null ? `${p.car_slots} car slot${p.car_slots !== 1 ? 's' : ''}` : "—", type: "parking" },
        {
            icon: faRulerCombined,
            label:
                p?.lot_area || p?.floor_area
                    ? `${p?.lot_area ? `Lot ${p.lot_area} m²` : ""}${p?.lot_area && p?.floor_area ? " • " : ""}${p?.floor_area ? `Floor ${p.floor_area} m²` : ""}`
                    : "—",
            type: "size"
        },
    ];

    // Quick actions contacts: agents if any, else broker if present
    const contacts = agents.length ? agents : broker ? [broker] : [];

    return (
        <BrokerLayout>
            <div className="page-container">
                <div className="page-content space-y-6">
                    {/* Header with Breadcrumb and Actions */}
                    <div className="section">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/broker/properties"
                                    className="btn btn-ghost btn-sm p-2"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </Link>
                                <Breadcrumb pages={pages} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/broker/properties/${p.id}/edit`}
                                    className="btn btn-primary btn-sm"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    Edit Property
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Property Header */}
                    <div className="card p-4 p-4">
                        <PropertyHeader
                            title={p?.title}
                            address={p?.address}
                            isPresell={isPresell}
                        />
                    </div>

                    {/* Main Image */}
                    <div className="card p-4 p-4 overflow-hidden p-0">
                        <MainImage image_url={p?.image_url} title={p?.title} />
                    </div>

                    {/* Thumbnails */}
                    {Array.isArray(p?.images) && p.images.length > 0 && (
                        <div className="card p-4">
                            <Thumbnail images={p.images} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT / MAIN CONTENT */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Price & Key Facts */}
                            <div className="card p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-primary-600">{priceText}</h2>
                                        {p?.address && (
                                            <p className="text-gray-600 mt-2 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
                                                {p.address}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {keyFacts.map((fact, index) => (
                                            <span
                                                key={index}
                                                className="badge badge-secondary"
                                            >
                                                <FontAwesomeIcon icon={fact.icon} className="mr-1" />
                                                {fact.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description & Specifications */}
                            <div className="card p-4">
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
                            </div>

                            {/* Location Map */}
                            <div className="card p-4">
                                <div className="card p-4-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <h3 className="text-xl font-semibold text-gray-900">Location & Directions</h3>
                                    <div className="flex items-center gap-2">
                                        {gmapsHref && (
                                            <a
                                                href={gmapsHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-sm"
                                            >
                                                <FontAwesomeIcon icon={faUpRightFromSquare} />
                                                Open in Maps
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={onShare}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <FontAwesomeIcon icon={faShareNodes} />
                                            Share Property
                                        </button>
                                    </div>
                                </div>
                                <div className="card p-4-body p-0">
                                    <PropertyMap coordinates={Array.isArray(p?.coordinate) ? p.coordinate : []} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Assigned Agents */}
                            <div className="card p-4">
                                <AssignedAgents agents={agents} auth={auth} />
                            </div>

                            {/* Quick Actions */}
                            <div className="card p-4 sticky top-6">
                                <div className="card p-4-header">
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="card p-4-body space-y-4">
                                    {/* Contact Actions */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-gray-700">Contact Options</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {contacts.map((contact, idx) => (
                                                <React.Fragment key={idx}>
                                                    {contact?.contact_number && (
                                                        <a
                                                            href={`tel:${contact.contact_number}`}
                                                            className="btn btn-primary btn-sm w-full justify-center"
                                                        >
                                                            <FontAwesomeIcon icon={faPhone} />
                                                            Call {contact.name || 'Agent'}
                                                        </a>
                                                    )}
                                                    {contact?.email && (
                                                        <a
                                                            href={`mailto:${contact.email}?subject=${encodeURIComponent(`Inquiry: ${p?.title || "Property"}`)}`}
                                                            className="btn btn-outline btn-sm w-full justify-center"
                                                        >
                                                            <FontAwesomeIcon icon={faEnvelope} />
                                                            Email {contact.name || 'Agent'}
                                                        </a>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            {contacts.length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-2">
                                                    No contact information available
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Actions */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-gray-700">Property Actions</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {gmapsHref && (
                                                <a
                                                    href={gmapsHref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline btn-sm w-full justify-center"
                                                >
                                                    <FontAwesomeIcon icon={faLocationDot} />
                                                    Get Directions
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={onShare}
                                                className="btn btn-outline btn-sm w-full justify-center"
                                            >
                                                <FontAwesomeIcon icon={faShareNodes} />
                                                Share Property Link
                                            </button>
                                            <Link
                                                href={`/broker/properties/${p.id}/edit`}
                                                className="btn btn-primary btn-sm w-full justify-center"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                Edit Property Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Property Status */}
                            <div className="card p-4">
                                <div className="card p-4-header">
                                    <h3 className="text-lg font-semibold text-gray-900">Property Status</h3>
                                </div>
                                <div className="card p-4-body">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Listing Status</span>
                                        <span className={`badge ${isPresell ? 'badge-warning' : 'badge-success'}`}>
                                            {isPresell ? 'Pre-Selling' : 'For Sale'}
                                        </span>
                                    </div>
                                    {p?.status && (
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">Publication</span>
                                            <span className={`badge ${
                                                p.status === 'Published' ? 'badge-success' :
                                                    p.status === 'Unpublished' ? 'badge-warning' : 'badge-gray'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BrokerLayout>
    );
}
