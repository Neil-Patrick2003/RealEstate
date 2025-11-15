// resources/js/Pages/Agents/SellerPostProperty.jsx
import React, { useMemo, useState, useEffect } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm, Link, router } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import {
    Filter, Search, AlertCircle, Send, Share2, MapPin, Heart, BedDouble, Bath, Ruler, Building2
} from "lucide-react";

/* utils */
const cn = (...c) => c.filter(Boolean).join(" ");
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

/* --------- Agent→Seller predefined templates (dropdown) --------- */
const MESSAGE_TEMPLATES = [
    {
        id: "cobroke",
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

/* --------- Card (always-visible actions — no hover reveal) --------- */
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
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                <img
                    src={img}
                    alt={property?.title || "Property"}
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    className="h-full w-full object-cover bg-gray-100"
                    loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-2 left-2 rounded-full bg-black/80 px-3 py-1 text-xs text-white shadow">
                    {property?.price ? currency.format(property.price) : "—"} <span className="opacity-80">PHP</span>
                </div>
                <div className="absolute top-2 left-2 flex gap-2">
                    {isPresell && (
                        <span className="rounded-full border border-amber-200 bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
              Preselling
            </span>
                    )}
                </div>
                {type && (
                    <div className="absolute top-2 right-2 rounded-full bg-gray-900/85 px-2.5 py-0.5 text-[11px] font-medium text-white">
                        {type}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-[15px] font-semibold text-gray-900">
                    {property?.title || "Untitled Property"}
                </h3>

                <p className="mt-1 flex items-start gap-1.5 text-xs text-gray-600">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
                    <span className="line-clamp-2">{property?.address || "Address not provided"}</span>
                    {property?.floor_area && (
                        <span className="inline-flex text-primary font-bold items-center gap-1 rounded-md">
                              {property.floor_area} ㎡
                        </span>
                    )}
                    {property?.lot_area && (
                        <span className="inline-flex items-center gap-1 rounded-md ">
                          <Ruler className="h-3.5 w-3.5" /> {property.lot_area} ㎡
                        </span>
                    )}
                </p>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {seller?.photo_url ? (
                            <img
                                src={`/storage/${seller.photo_url}`}
                                alt={seller?.name || "Seller"}
                                onError={(e) => (e.currentTarget.style.display = "none")}
                                className="h-7 w-7 rounded-full border object-cover"
                            />
                        ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
                                {(seller?.name || "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="text-[11px] leading-4">
                            <div className="font-medium text-gray-900">{seller?.name || "Seller"}</div>
                            <div className="text-gray-500">Verified Seller</div>
                        </div>
                    </div>
                    <button
                        onClick={onShare}
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                        title="Share property"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </button>
                </div>

                {/* Always-visible actions */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={onView}
                        className="col-span-1 rounded-md border border-gray-900 px-3 py-2 text-center text-xs font-medium text-gray-900 transition hover:bg-gray-900 hover:text-white"
                        title="View details"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        onClick={onInquiry}
                        className="col-span-2 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-accent"
                        title="Contact seller"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Contact Seller
                    </button>
                </div>
            </div>
        </article>
    );
}

/* ------------------------- Page ------------------------- */
export default function SellerPostProperty({ properties }) {
    const pages = useMemo(() => [{ name: "Properties", href: "/seller/properties", current: true }], []);

    // controls
    const [type, setType] = useState("all");
    const [presellOnly, setPresellOnly] = useState(false);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("newest"); // newest | price_asc | price_desc

    // inquiry modal
    const [isContactSeller, setIsContactSeller] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const { data, setData, post, processing, errors } = useForm({ property_id: "", message: "" });

    // dropdown + signature state
    const [selectedTemplateId, setSelectedTemplateId] = useState(MESSAGE_TEMPLATES[0].id);
    const [appendSignature, setAppendSignature] = useState(true);
    const [signature, setSignature] = useState({ name: "", phone: "", email: "" });

    // persist signature locally (agent can set once)
    useEffect(() => {
        try {
            const raw = localStorage.getItem("agentSignature");
            if (raw) setSignature(JSON.parse(raw));
        } catch {}
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem("agentSignature", JSON.stringify(signature));
        } catch {}
    }, [signature]);

    const list = properties?.data ?? [];

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

        // default-fill from current dropdown selection (agent template tone)
        const t = MESSAGE_TEMPLATES.find((x) => x.id === selectedTemplateId) ?? MESSAGE_TEMPLATES[0];
        const text = t.body({ title: property?.title || "the property" });
        setData("message", text);
    }

    function handleTemplateChange(e) {
        const newId = e.target.value;
        setSelectedTemplateId(newId);
        const t = MESSAGE_TEMPLATES.find((x) => x.id === newId);
        if (!t) return;
        const text = t.body({ title: selectedProperty?.title || "the property" });
        setData("message", text);
    }

    function handleSubmitInquiry() {
        if (!selectedProperty || data.message.trim().length === 0) return;

        const sigParts = [signature.name, signature.phone, signature.email].filter(Boolean);
        const finalMessage =
            appendSignature && sigParts.length
                ? `${data.message}\n\n— ${sigParts.join(" • ")}`
                : data.message;

        post(`/agents/properties/${selectedProperty.id}/sent-inquiry`, {
            preserveScroll: true,
            only: ["flash"],
            data: { ...data, message: finalMessage },
            onSuccess: () => {
                setIsContactSeller(false);
                setSelectedProperty(null);
                setData("message", "");
            },
        });
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
            {/* Inquiry Modal (agent → seller) */}
            <Modal show={isContactSeller} onClose={() => setIsContactSeller(false)} maxWidth="2xl">
                <div className="relative rounded-2xl bg-white p-6 shadow-lg sm:p-8">
                    <button
                        onClick={() => setIsContactSeller(false)}
                        className="absolute right-4 top-4 text-xl font-bold text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>

                    {/* seller header */}
                    <div className="mb-6 flex items-center gap-4">
                        {selectedProperty?.seller?.photo_url ? (
                            <img
                                src={`/storage/${selectedProperty?.seller?.photo_url}`}
                                alt={`${selectedProperty?.seller?.name}'s avatar`}
                                className="h-14 w-14 rounded-full border object-cover"
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold uppercase text-white">
                                {selectedProperty?.seller?.name?.charAt(0) ?? "S"}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedProperty?.seller?.name || "Seller"}
                            </h3>
                            <p className="text-sm text-gray-500">Listing Owner</p>
                            {selectedProperty?.title && (
                                <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {selectedProperty.title}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Template dropdown */}
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Choose a pre-composed message</label>
                        <select
                            value={selectedTemplateId}
                            onChange={handleTemplateChange}
                            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                        >
                            {MESSAGE_TEMPLATES.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Editable message */}
                    <div className="mb-5">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Message to seller (editable)
                        </label>
                        <textarea
                            id="message"
                            rows={5}
                            maxLength={600}
                            placeholder='E.g., "Hi! I have a client for this listing. May we schedule a site tripping?"'
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            className="mt-2 w-full resize-none rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs">
              <span className="h-4 text-red-500">
                {errors?.message ? (
                    <span className="inline-flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                        {errors.message}
                  </span>
                ) : null}
              </span>
                            <span className="text-gray-500">{`${data.message.length}/600`}</span>
                        </div>
                    </div>

                    {/* CTASection */}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => setIsContactSeller(false)}
                            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={processing || data.message.trim().length === 0}
                            onClick={handleSubmitInquiry}
                            className={cn(
                                "rounded-md px-5 py-2 text-sm font-medium text-white transition",
                                processing || data.message.trim().length === 0
                                    ? "cursor-not-allowed bg-primary opacity-50"
                                    : "bg-primary hover:bg-primary-dark"
                            )}
                        >
                            {processing ? "Sending…" : "Send to Seller"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="mb-6 px-4">
                <Breadcrumbs pages={pages} />
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Seller Listings</h1>
                    <div className="text-xs text-gray-500">
                        Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-4 px-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Filter className="h-3.5 w-3.5" />
                Type
              </span>
                            {[
                                ["all", "All"],
                                ["house", "House"],
                                ["condo", "Condo"],
                                ["land", "Land"],
                            ].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setType(val)}
                                    className={cn(
                                        "rounded-md border px-3 py-1.5 text-xs",
                                        type === val ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={presellOnly}
                                onChange={(e) => setPresellOnly(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Preselling only
                        </label>

                        <div className="flex-1" />

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search title, address…"
                                className="w-[260px] rounded-md border border-gray-200 bg-gray-100 px-9 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="rounded-md border bg-white px-3 py-2 text-sm"
                            title="Sort"
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="px-4">
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
                        No properties matched your filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            </div>

            {/* Pagination */}
            {properties?.links?.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 p-6">
                    {properties.links.map((link, idx) =>
                        link.url ? (
                            <Link
                                key={idx}
                                href={link.url}
                                className={cn(
                                    "rounded-md border px-3 py-2 text-sm transition",
                                    link.active ? "bg-primary font-semibold text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={idx}
                                className="cursor-not-allowed rounded-md border bg-white px-3 py-2 text-sm text-gray-400"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </AgentLayout>
    );
}
