// resources/js/Pages/Agents/SellerPostProperty.jsx
import React, { useMemo, useState, useEffect } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm, Link, router } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import {
    Filter, Search, AlertCircle, Send, Share2, MapPin, Building2,
    Home, Ruler, Users, FileText, X, MessageCircle
} from "lucide-react";

/* utils */
const cn = (...c) => c.filter(Boolean).join(" ");
const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
});

/* --------- Agent→Seller predefined templates (dropdown) --------- */
const MESSAGE_TEMPLATES = [
    {
        id: "cobroker",
        title: "Co-brokering Inquiry",
        body: ({ title }) =>
            `Hi! I'm an agent interested in co-brokering your listing "${title}". May I know if co-broking is allowed and the commission sharing terms?`,
    },
    {
        id: "price_inventory",
        title: "Updated Price List & Availability",
        body: ({ title }) =>
            `Hello! Could you send the updated price, availability/inventory, and any current promos for "${title}"?`,
    },
    {
        id: "site_tripping",
        title: "Arrange Site Tripping (with client)",
        body: ({ title }) =>
            `Hi! I have a qualified client for "${title}". May we schedule a site tripping this week? Please share available dates/times and on-site contact.`,
    },
    {
        id: "docs",
        title: "Documents / Project Brief",
        body: ({ title }) =>
            `Hello! Kindly share the project brief and basic docs for "${title}" (brochure, sample computation, requirements, reservation process).`,
    },
    {
        id: "commission_terms",
        title: "Commission / Reservation Process",
        body: ({ title }) =>
            `Hi! For "${title}", may I confirm reservation steps, required documents, and agent commission payout timeline?`,
    },
];

// Property Type Badge using utility classes
function TypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const map = {
        house: {
            icon: Home,
            cls: "badge-primary",
            iconCls: "text-primary-600"
        },
        Condominium: {
            icon: Building2,
            cls: "badge-accent",
            iconCls: "text-emerald-600"
        },
        land:  {
            icon: Ruler,
            cls: "badge-success",
            iconCls: "text-emerald-600"
        },
        default:{
            icon: Building2,
            cls: "badge-gray",
            iconCls: "text-gray-600"
        },
    };
    const Item = map[t] || map.default;
    const Icon = Item.icon;
    return (
        <span className={cn("badge text-xs font-semibold inline-flex items-center gap-1", Item.cls)}>
            <Icon className={cn("w-3 h-3", Item.iconCls)} />
            {type || "Property"}
        </span>
    );
}

// Status Badge for Preselling
function PresellBadge() {
    return (
        <span className="badge badge-warning text-xs font-semibold">
            Preselling
        </span>
    );
}

// Filter Tabs Component

/* --------- Enhanced Modal Component --------- */
function InquiryModal({
                          isOpen,
                          onClose,
                          selectedProperty,
                          data,
                          setData,
                          processing,
                          errors,
                          selectedTemplateId,
                          setSelectedTemplateId,
                          onSubmit
                      }) {
    if (!isOpen || !selectedProperty) return null;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            {/* Modal Header */}
            <div className="card-header border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="feature-icon bg-primary-50 text-primary-600">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Contact Seller
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Send inquiry for {selectedProperty?.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Modal Body */}
            <div className="card-body space-y-6">
                {/* Seller Information */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    {selectedProperty?.seller?.photo_url ? (
                        <img
                            src={`/storage/${selectedProperty?.seller?.photo_url}`}
                            alt={`${selectedProperty?.seller?.name}'s avatar`}
                            className="avatar-md rounded-full object-cover ring-2 ring-white dark:ring-gray-600"
                        />
                    ) : (
                        <div className="avatar-md bg-primary text-white font-semibold">
                            {selectedProperty?.seller?.name?.charAt(0) ?? "S"}
                        </div>
                    )}
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {selectedProperty?.seller?.name || "Seller"}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Listing Owner</p>
                        <div className="flex items-center gap-2 mt-1">
                            <TypeBadge type={selectedProperty?.property_type} />
                            {!!(selectedProperty?.isPresell ?? selectedProperty?.is_presell) && <PresellBadge />}
                        </div>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="form-group">
                    <label className="form-label">Message Template</label>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="form-select flex-1"
                        >
                            {MESSAGE_TEMPLATES.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                const t = MESSAGE_TEMPLATES.find((x) => x.id === selectedTemplateId);
                                if (t) {
                                    const text = t.body({ title: selectedProperty?.title || "the property" });
                                    setData("message", text);
                                }
                            }}
                            className="btn btn-outline btn-sm whitespace-nowrap"
                        >
                            Apply Template
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Choose a pre-written message template or write your own
                    </p>
                </div>

                {/* Message Composition */}
                <div className="form-group">
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="message" className="form-label">
                            Your Message
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {data.message.length}/600 characters
                        </span>
                    </div>
                    <textarea
                        id="message"
                        rows={6}
                        maxLength={600}
                        placeholder="Write your message to the seller here..."
                        value={data.message}
                        onChange={(e) => setData("message", e.target.value)}
                        className="form-textarea resize-vertical"
                    />
                    {errors?.message && (
                        <div className="form-error mt-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.message}
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="feature-icon bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300 mt-0.5">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Tips for Effective Communication
                            </h4>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Be clear about your client's requirements and timeline</li>
                                <li>• Ask specific questions about commission and terms</li>
                                <li>• Request available documentation and project details</li>
                                <li>• Suggest specific dates for site visits if applicable</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="card-footer border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        This message will be sent directly to the seller
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={processing || data.message.trim().length === 0}
                            className={cn(
                                "btn btn-primary inline-flex items-center gap-2",
                                (processing || data.message.trim().length === 0) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {processing ? (
                                <>
                                    <div className="spinner-sm" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Inquiry
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

/* --------- Card using utility classes --------- */
function PropertyGridCard({ property, onView, onInquiry, onShare }) {
    const img =
        property?.image_url
            ? `/storage/${property.image_url}`
            : property?.images?.[0]
                ? `/storage/${property.images[0]}`
                : "/placeholder.png";

    const isPresell = !!(property?.isPresell ?? property?.is_presell);
    const type = (property?.property_type || "").toLowerCase();
    const seller = property?.seller;

    return (
        <article className="card-hover property-card group flex flex-col h-full">
            {/* Image & Overlay */}
            <div className="relative">
                <img
                    src={img}
                    alt={property?.title || "Property"}
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    className="property-card-image"
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

                {/* Price Badge */}
                <div className="absolute bottom-2 left-2 badge badge-gray text-white bg-gray-900/90 border-0">
                    {property?.price ? currency.format(property.price) : "—"}
                </div>

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                    {isPresell && <PresellBadge />}
                </div>

                <div className="absolute top-2 right-2">
                    <TypeBadge type={type} />
                </div>
            </div>

            {/* Card Content */}
            <div className="card-body flex flex-col gap-3 flex-1 p-0">
                <div className="p-4 pb-2">
                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {property?.title || "Untitled Property"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <span className="line-clamp-2 flex-1">{property?.address || "Address not provided"}</span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {property?.floor_area && (
                            <span className="inline-flex items-center gap-1">
                                <Ruler className="h-3.5 w-3.5" />
                                {property.floor_area} sqm
                            </span>
                        )}
                        {property?.bedrooms > 0 && (
                            <span className="inline-flex items-center gap-1">
                                🛏 {property.bedrooms}
                            </span>
                        )}
                        {property?.bathrooms > 0 && (
                            <span className="inline-flex items-center gap-1">
                                🚿 {property.bathrooms}
                            </span>
                        )}
                    </div>
                </div>

                {/* Seller Info & Actions */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
                    {/* Seller Info */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {seller?.photo_url ? (
                                <img
                                    src={`/storage/${seller.photo_url}`}
                                    alt={seller?.name || "Seller"}
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                    className="avatar-sm ring-1 ring-white dark:ring-gray-600"
                                />
                            ) : (
                                <div className="avatar-sm bg-gray-900 text-white">
                                    {(seller?.name || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="text-sm leading-4">
                                <div className="font-medium text-gray-900 dark:text-white">{seller?.name || "Seller"}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs">Verified Seller</div>
                            </div>
                        </div>
                        <button
                            onClick={onShare}
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Share property"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Always-visible actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onView}
                            className="btn btn-outline btn-sm"
                            title="View details"
                        >
                            View Details
                        </button>

                        <button
                            type="button"
                            onClick={onInquiry}
                            className="btn btn-primary btn-sm inline-flex items-center justify-center gap-1"
                            title="Contact seller"
                        >
                            <Send className="h-4 w-4" />
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

/* ------------------------- Page ------------------------- */
export default function SellerPostProperty({ properties }) {
    const pages = useMemo(() => [{ name: "Seller Listings", href: "/agents/seller-listings", current: true }], []);

    // controls
    const [type, setType] = useState("all");
    const [presellOnly, setPresellOnly] = useState(false);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("newest");

    // inquiry modal
    const [isContactSeller, setIsContactSeller] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        property_id: "",
        message: ""
    });

    // template state
    const [selectedTemplateId, setSelectedTemplateId] = useState(MESSAGE_TEMPLATES[0].id);

    const list = properties?.data ?? [];

    // Calculate counts for each property type
    const typeCounts = useMemo(() => {
        const counts = { all: list.length, house: 0, Condominium: 0, land: 0 };
        list.forEach((property) => {
            const propType = (property.property_type || "").toLowerCase();
            if (propType in counts) {
                counts[propType]++;
            }
        });
        return counts;
    }, [list]);

    const filtered = useMemo(() => {
        let items = [...list];

        if (type !== "all") {
            items = items.filter((p) => (p.property_type || "").toLowerCase() === type);
        }

        if (presellOnly) {
            items = items.filter((p) => !!(p.isPresell ?? p.is_presell));
        }

        const query = q.trim().toLowerCase();
        if (query) {
            items = items.filter((p) => {
                const hay = `${p.title || ""} ${p.address || ""} ${p.description || ""}`.toLowerCase();
                return hay.includes(query);
            });
        }

        items.sort((a, b) => {
            if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
            if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
            const A = new Date(a.created_at || 0).valueOf() || Number(a.id) || 0;
            const B = new Date(b.created_at || 0).valueOf() || Number(b.id) || 0;
            return B - A; // newest
        });

        return items;
    }, [list, type, presellOnly, q, sort]);

    /* actions */
    function openInquiry(property) {
        setSelectedProperty(property);
        setIsContactSeller(true);
        setData("property_id", property.id);

        // Apply current template
        const t = MESSAGE_TEMPLATES.find((x) => x.id === selectedTemplateId) ?? MESSAGE_TEMPLATES[0];
        const text = t.body({ title: property?.title || "the property" });
        setData("message", text);
    }

    function handleSubmitInquiry() {
        if (!selectedProperty || data.message.trim().length === 0) return;

        post(`/agents/properties/${selectedProperty.id}/sent-inquiry`, {
            preserveScroll: true,
            only: ["flash"],
            data: { ...data },
            onSuccess: () => {
                setIsContactSeller(false);
                setSelectedProperty(null);
                setData("message", "");
            },
        });
    }

    function closeModal() {
        setIsContactSeller(false);
        setSelectedProperty(null);
        setData("message", "");
    }

    async function shareProperty(p) {
        const url = `${window.location.origin}/agents/properties/${p.id}`;
        const title = p.title || "Property";
        try {
            if (navigator.share) {
                await navigator.share({ title, text: p.address || "", url });
                return;
            }
        } catch {}
        try {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard");
        } catch {
            prompt("Copy this link:", url);
        }
    }

    return (
        <AgentLayout>
            {/* Enhanced Inquiry Modal */}
            <InquiryModal
                isOpen={isContactSeller}
                onClose={closeModal}
                selectedProperty={selectedProperty}
                data={data}
                setData={setData}
                processing={processing}
                errors={errors}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
                onSubmit={handleSubmitInquiry}
            />

            {/* Page Header */}
            <div className="page-content space-y-6">
                <div className="section-header">
                    <div>
                        <h1 className="section-title">Seller Listings</h1>
                        <p className="section-description">
                            Browse and contact sellers for potential co-brokering opportunities
                        </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="card p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Property Type Tabs */}
                        {/* Property Type Tabs */}

                        <div className="flex-1" />

                        {/* Additional Filters */}
                        <div className="flex items-center gap-4">
                            {/* Presell Filter */}
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={presellOnly}
                                    onChange={(e) => setPresellOnly(e.target.checked)}
                                    className="form-checkbox"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Preselling only</span>
                            </label>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search listings..."
                                    className="form-input pl-9 w-[200px]"
                                />
                            </div>

                            {/* Sort */}
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="form-select"
                                title="Sort by"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Properties Grid */}
                {filtered.length === 0 ? (
                    <div className="card text-center py-12">
                        <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            No properties found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your filters or search terms
                        </p>
                    </div>
                ) : (
                    <div className="grid-properties">
                        {filtered.map((p) => (
                            <PropertyGridCard
                                key={p.id}
                                property={p}
                                onView={() => router.visit(`/agents/properties/${p.id}`)}
                                onInquiry={() => openInquiry(p)}
                                onShare={() => shareProperty(p)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {properties?.links?.length > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                        {properties.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={cn(
                                        "btn btn-outline btn-sm",
                                        link.active && "btn-primary"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="btn btn-outline btn-sm opacity-50 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </AgentLayout>
    );
}
