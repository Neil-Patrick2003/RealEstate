// resources/js/Pages/Agents/MyListings.jsx
import React, { useMemo, useState } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import {
    MapPin,
    Share2,
    Users,
    BadgeCheck,
    CheckCircle2,
    Clock3,
    Home,
    Building2,
    Ruler,
    Tag,
    Filter,
    Search,
    ChevronDown,
    Calendar,
    Eye, // Added for View Button
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");
// PHP Currency Formatter
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }); // Reduced fraction digits for brevity

/** Normalize listing row to avoid 0/1 vs boolean, mixed types, etc. */
function normalizeListing(row = {}) {
    const property = row.property || {};
    return {
        ...row,
        status: row.status || "Published",
        created_at: row.created_at,
        property: {
            ...property,
            title: property.title || "Property",
            address: property.address || "",
            image_url: property.image_url || null,
            price: Number(property.price ?? 0),
            property_type: (property.property_type || "").toLowerCase(), // "house" | "condo" | "land" | etc
            lot_area: property.lot_area,
            floor_area: property.floor_area,
            isPresell: typeof property.isPresell === "boolean" ? property.isPresell : !!Number(property.isPresell),
        },
        seller: row.seller || null,
        agents: Array.isArray(row.agents) ? row.agents : [],
    };
}

// Badge Refinement: Subtle, rounded edges
function TypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const map = {
        house: { icon: Home, cls: "bg-blue-50 text-blue-700" },
        condo: { icon: Building2, cls: "bg-violet-50 text-violet-700" },
        land:  { icon: Ruler, cls: "bg-emerald-50 text-emerald-700" },
        default:{ icon: Tag, cls: "bg-gray-100 text-gray-700" },
    };
    const Item = map[t] || map.default;
    const Icon = Item.icon;
    return (
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset", Item.cls, Item.cls.replace('-50', '-200'))}>
            <Icon className="w-3 h-3" />
            {type || "Property"}
        </span>
    );
}

// Status Badge Refinement: Bolder, cleaner indicators
function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    if (s === "assigned") {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full shadow-md">
                <BadgeCheck className="w-3 h-3" /> Assigned
            </span>
        );
    }
    if (s === "sold") {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full shadow-md">
                <CheckCircle2 className="w-3 h-3" /> Sold
            </span>
        );
    }
    // Default/Published
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-600 text-white px-2 py-0.5 rounded-full shadow-md">
            <Clock3 className="w-3 h-3" /> Published
        </span>
    );
}

function SellerChip({ seller }) {
    if (!seller) return null;
    const initials = (seller.name || "?").slice(0, 1).toUpperCase();
    return (
        <div className="inline-flex items-center gap-1.5 p-0.5 rounded-full bg-gray-100/70 transition hover:bg-gray-100">
            {seller.photo_url ? (
                <img
                    src={`/storage/${seller.photo_url}`}
                    alt={seller.name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white"
                    onError={(e)=>{e.currentTarget.src="/placeholder.png";}}
                />
            ) : (
                <div className="w-4 h-4 rounded-full bg-gray-500 text-white text-[8px] flex items-center justify-center">
                    {initials}
                </div>
            )}
            <span className="text-xs text-gray-700 font-medium truncate max-w-[80px]">{seller.name}</span>
        </div>
    );
}

// Small avatar stack for assigned agents
function AgentsStack({ agents = [] }) {
    const ArrayOf = (arr) => (Array.isArray(arr) ? arr : []);
    if (!ArrayOf(agents).length) return null;

    return (
        <div className="flex -space-x-1.5">
            {agents.slice(0, 3).map((a, i) => {
                const key = a?.id ?? i;
                const initials = (a?.name || "?").slice(0, 1).toUpperCase();
                const src = a?.photo_url
                    ? `/storage/${a.photo_url}`
                    : a?.avatar_url
                        ? `/storage/${a.avatar_url}`
                        : null;

                return src ? (
                    <img
                        key={key}
                        src={src}
                        alt={a?.name ? `${a.name} (Agent)` : "Agent"}
                        title={a?.name || "Agent"}
                        className="w-5 h-5 rounded-full object-cover ring-2 ring-white border border-gray-200 bg-white"
                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    />
                ) : (
                    <div
                        key={key}
                        className="w-5 h-5 rounded-full bg-gray-500 text-white text-[9px] flex items-center justify-center ring-2 ring-white border border-gray-200"
                        title={a?.name || "Agent"}
                        aria-label={a?.name || "Agent"}
                    >
                        {initials}
                    </div>
                );
            })}

            {agents.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-gray-100 ring-2 ring-white border border-gray-200 flex items-center justify-center text-[9px] text-gray-600">
                    +{agents.length - 3}
                </div>
            )}
        </div>
    );
}


function Card({ listing, onView, onShare }) {
    const p = listing.property;
    const img = p.image_url ? `/storage/${p.image_url}` : "/placeholder.png";
    const area = p.property_type === "land" ? p.lot_area : p.floor_area;

    return (
        <article className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col transform hover:scale-[1.01] duration-300 border border-gray-100">
            {/* Image & Overlay Actions */}
            <div className="relative">
                <img
                    src={img}
                    alt={p.title}
                    className="w-full aspect-[16/11] object-cover bg-gray-100 transition duration-300 group-hover:scale-[1.05]"
                    onError={(e)=>{e.currentTarget.src="/placeholder.png";}}
                    loading="lazy"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-center justify-center">
                    <button
                        onClick={onView}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold shadow-xl hover:bg-green-700 transform translate-y-2 group-hover:translate-y-0"
                    >
                        <Eye className="w-4 h-4" /> View Details
                    </button>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                    <TypeBadge type={p.property_type} />
                </div>
                <div className="absolute top-2 right-2">
                    <StatusBadge status={listing.status} />
                </div>

                {p.isPresell && (
                    <div className="absolute bottom-0 left-0 bg-orange-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-tr-lg shadow-lg">
                        Preselling
                    </div>
                )}
            </div>

            {/* Body: Main Details */}
            <div className="p-4 pb-2 flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-extrabold text-gray-900 leading-snug line-clamp-2 min-h-[48px]">{p.title}</h3>

                {/* Price (Primary Focus) */}
                <p className="text-2xl font-black text-green-700 mt-1">
                    {currency.format(p.price)}
                </p>

                {/* Location & Area (Combined into one section) */}
                <div className="flex flex-col gap-1 text-xs text-gray-600 border-t border-gray-100 pt-3 mt-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 shrink-0 text-green-500" />
                        <span className="line-clamp-1" title={p.address}>{p.address || "Location Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Ruler className="w-3 h-3 shrink-0 text-gray-400" />
                        <span className="font-semibold">{area ? `${area} sqm` : "Area Unknown"}</span>
                        <span className="text-gray-400">•</span>
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{dayjs(listing.created_at).format("MMM D, YYYY")}</span>
                    </div>
                </div>
            </div>

            {/* Footer: Metadata (Seller & Agents) & Share Button - Recessed look */}
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                <SellerChip seller={listing.seller} />
                <div className="flex items-center gap-3 shrink-0">
                    <AgentsStack agents={listing.agents} />
                    <button
                        onClick={onShare}
                        className="p-1.5 rounded-full text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm"
                        title="Share Listing"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

        </article>
    );
}

// Utility to ensure array is used
const ArrayOf = (arr) => (Array.isArray(arr) ? arr : []);

export default function MyListings({ listings }) {

    // listings is your paginator payload from controller
    const normalized = useMemo(() => ArrayOf(listings?.data).map(normalizeListing), [listings?.data]);

    // filters/sort/search (client-side for now)
    const [status, setStatus] = useState("all"); // all | assigned | published | sold
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("newest"); // newest | price_asc | price_desc

    const filtered = useMemo(() => {
        let arr = [...normalized];
        if (status !== "all") {
            arr = arr.filter((r) => (r.status || "").toLowerCase() === status);
        }
        const query = q.trim().toLowerCase();
        if (query) {
            arr = arr.filter((r) => {
                const p = r.property || {};
                const hay = `${p.title || ""} ${p.address || ""} ${r.status || ""}`.toLowerCase();
                return hay.includes(query);
            });
        }
        // sort
        arr.sort((a, b) => {
            if (sort === "price_asc") return (a.property.price ?? Infinity) - (b.property.price ?? Infinity);
            if (sort === "price_desc") return (b.property.price ?? -Infinity) - (a.property.price ?? -Infinity);
            // newest by created_at
            const A = new Date(a.created_at || 0).valueOf();
            const B = new Date(b.created_at || 0).valueOf();
            return B - A;
        });
        return arr;
    }, [normalized, status, q, sort]);

    // share helper
    async function shareListing(listing) {
        // NOTE: Adjusted URL to use a standard format for sharing
        const url = `${window.location.origin}/properties/${listing.id}`;
        const title = listing.property.title || "Property Listing";
        try {
            if (navigator?.share) {
                await navigator.share({
                    title,
                    text: `Check out this listing: ${listing.property.title}\n${listing.property.address || ""}`,
                    url
                });
                return;
            }
        } catch (e) {
            // Sharing failed or was cancelled
        }

        try {
            await navigator?.clipboard?.writeText(url);
            alert("Listing link copied to clipboard!");
        } catch {
            prompt("Copy this link:", url);
        }
    }

    // counts for tabs
    const counts = useMemo(() => {
        const c = { all: normalized.length, assigned: 0, published: 0, sold: 0 };
        normalized.forEach((r) => {
            const s = (r.status || "").toLowerCase();
            if (s === "assigned") c.assigned++;
            else if (s === "sold") c.sold++;
            else c.published++; // Treat non-assigned/non-sold as 'published' for the tab
        });
        return c;
    }, [normalized]);

    return (
        <AgentLayout>
            <div className="px-4 md:px-6 lg:px-8 py-8 space-y-8">
                {/* --- Header --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">My Listings</h1>
                        <p className="text-gray-600 text-sm mt-1">Manage and track properties you are responsible for.</p>
                    </div>
                </div>

                {/* --- Controls / Filter Panel --- */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                        {/* Status Tabs */}
                        <div className="inline-flex rounded-xl bg-gray-100 p-1 shrink-0 overflow-x-auto">
                            {[
                                ["all", "All"],
                                ["assigned", "Assigned"],
                                ["published", "Published"],
                                ["sold", "Sold"],
                            ].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setStatus(val)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-200 whitespace-nowrap",
                                        status === val
                                            ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-200"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    {label} <span className="opacity-70">({counts[val] || 0})</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1" />

                        {/* Search Input */}
                        <div className="relative w-full sm:w-[260px] shrink-0">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search title or address…"
                                className="pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-100 text-gray-700 border-none focus:ring-2 focus:ring-green-400 focus:bg-white focus:outline-none w-full transition"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative inline-flex items-center shrink-0">
                            <Filter className="w-4 h-4 text-gray-600 absolute left-3" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="pl-8 pr-8 py-2.5 text-sm rounded-xl border border-gray-300 bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-green-400 transition"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* --- Listings Grid --- */}
                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-lg border border-gray-200">
                        <Home className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-800">No Listings Found</h3>
                        <p className="text-sm mt-1">Adjust your filters or create a new listing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5   gap-6">
                        {filtered.map((listing) => (
                            <Card
                                key={listing.id}
                                listing={listing}
                                // NOTE: Assuming route name is correct, otherwise replace with hardcoded path
                                onView={() => router.visit(route('agents.listings.show', listing.id))}
                                onShare={() => shareListing(listing)}
                            />
                        ))}
                    </div>
                )}

                {/* --- Pagination --- */}
                {ArrayOf(listings?.links).length > 3 && (
                    <div className="flex flex-wrap gap-2 justify-center items-center pt-4">
                        {listings.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm",
                                        link.active ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="px-4 py-2 text-sm text-gray-400 bg-white rounded-lg shadow-sm cursor-not-allowed"
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
