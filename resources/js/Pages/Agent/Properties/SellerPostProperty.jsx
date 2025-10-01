// resources/js/Pages/Agents/SellerPostProperty.jsx
import React, { useMemo, useState } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm, Link, router } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import { Filter, Search, AlertCircle, Send, Share2 } from "lucide-react";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";

/* utils */
const cn = (...c) => c.filter(Boolean).join(" ");
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });

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

    const list = properties?.data ?? [];

    const filtered = useMemo(() => {
        let items = [...list];

        if (type !== "all") {
            items = items.filter((p) => (p.property_type || "").toLowerCase() === type);
        }

        // accept true/false or 1/0
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
    }

    function handleSubmitInquiry() {
        if (!selectedProperty || data.message.trim().length === 0) return;
        post(`/agents/properties/${selectedProperty.id}/sent-inquiry`, {
            preserveScroll: true,
            only: ["flash"],
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
            {/* Inquiry Modal */}
            <Modal show={isContactSeller} onClose={() => setIsContactSeller(false)} maxWidth="2xl">
                <div className="relative bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    <button
                        onClick={() => setIsContactSeller(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none text-xl font-bold"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>

                    {/* seller header */}
                    <div className="flex items-center gap-4 mb-6">
                        {selectedProperty?.seller?.photo_url ? (
                            <img
                                src={`/storage/${selectedProperty?.seller?.photo_url}`}
                                alt={`${selectedProperty?.seller?.name}'s avatar`}
                                className="w-14 h-14 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white text-lg font-semibold uppercase">
                                {selectedProperty?.seller?.name?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{selectedProperty?.seller?.name || "Unknown Seller"}</h3>
                            <p className="text-sm text-gray-500">Seller</p>
                        </div>
                    </div>

                    {/* message */}
                    <div className="mb-5">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700 block">
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            maxLength={250}
                            placeholder="Hi, I'm interested in this property. Please contact me..."
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-800 resize-none"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-red-500 h-4">
                {errors?.message ? (
                    <span className="inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                  </span>
                ) : null}
              </span>
                            <span className="text-gray-500">{`${data.message.length}/250`}</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setIsContactSeller(false)} className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm">
                            Cancel
                        </button>
                        <button
                            disabled={processing || data.message.trim().length === 0}
                            onClick={handleSubmitInquiry}
                            className={cn(
                                "bg-primary text-white font-medium px-5 py-2 rounded-md transition text-sm",
                                processing || data.message.trim().length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark"
                            )}
                        >
                            {processing ? "Sending…" : "Send Message"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="mb-6 px-4">
                <Breadcrumbs pages={pages} />
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">All Properties</h1>
                    <div className="text-xs text-gray-500">Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="px-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* type */}
                        <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Filter className="w-3.5 h-3.5" />
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
                                        "px-3 py-1.5 text-xs rounded-md border",
                                        type === val ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* presell */}
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={presellOnly}
                                onChange={(e) => setPresellOnly(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Preselling only
                        </label>

                        <div className="flex-1" />

                        {/* search */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search title, address…"
                                className="pl-9 pr-3 py-2 text-sm rounded-md bg-gray-100 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:outline-none w-[260px]"
                            />
                        </div>

                        {/* sort */}
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md border bg-white"
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
                    <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">No properties matched your filters.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filtered.map((p) => (
                            <PropertyCard
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
                <div className="flex flex-wrap gap-2 justify-center items-center p-6">
                    {properties.links.map((link, idx) =>
                        link.url ? (
                            <Link
                                key={idx}
                                href={link.url}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm border transition",
                                    link.active ? "bg-primary text-white font-semibold" : "bg-white text-gray-600 hover:bg-gray-100"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={idx}
                                className="px-3 py-2 text-sm text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </AgentLayout>
    );
}
