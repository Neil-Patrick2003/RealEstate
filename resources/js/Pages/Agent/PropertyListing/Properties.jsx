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
    Eye,
    Plus,
    FileText,
    Download,
    Upload
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

const cn = (...c) => c.filter(Boolean).join(" ");
// PHP Currency Formatter
const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
});

/** Normalize listing row to avoid 0/1 vs boolean, mixed types, etc. */
function normalizeListing(row = {}) {
    const property = row.property || {};
    return {
        ...row,
        status: row.status || "Published",
        created_at: row.created_at,
        updated_at: row.updated_at,
        property: {
            ...property,
            title: property.title || "Property",
            address: property.address || "",
            image_url: property.image_url || null,
            price: Number(property.price ?? 0),
            property_type: (property.property_type || "").toLowerCase(),
            lot_area: property.lot_area,
            floor_area: property.floor_area,
            isPresell: typeof property.isPresell === "boolean" ? property.isPresell : !!Number(property.isPresell),
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
        },
        seller: row.seller || null,
        agents: Array.isArray(row.agents) ? row.agents : [],
        views: row.views || 0,
        inquiries: row.inquiries || 0,
    };
}

// Badge using utility classes
function TypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const map = {
        house: {
            icon: Home,
            cls: "badge-primary",
            iconCls: "text-primary-600"
        },
        condo: {
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
            icon: Tag,
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

// Status Badge using utility classes
function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    if (s === "assigned") {
        return (
            <span className="badge badge-primary text-xs font-semibold inline-flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Assigned
            </span>
        );
    }
    if (s === "sold") {
        return (
            <span className="badge badge-success text-xs font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sold
            </span>
        );
    }
    if (s === "draft") {
        return (
            <span className="badge badge-warning text-xs font-semibold inline-flex items-center gap-1">
                <FileText className="w-3 h-3" /> Draft
            </span>
        );
    }
    // Default/Published
    return (
        <span className="badge badge-secondary text-xs font-semibold inline-flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> Published
        </span>
    );
}

function SellerChip({ seller }) {
    if (!seller) return null;
    const initials = (seller.name || "?").slice(0, 1).toUpperCase();
    return (
        <div className="inline-flex items-center gap-1.5 p-0.5 rounded-full bg-gray-100/70 dark:bg-gray-700/50 transition hover:bg-gray-100 dark:hover:bg-gray-600">
            {seller.photo_url ? (
                <img
                    src={`/storage/${seller.photo_url}`}
                    alt={seller.name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white dark:ring-gray-600"
                    onError={(e)=>{e.currentTarget.src="/placeholder.png";}}
                />
            ) : (
                <div className="avatar-sm bg-gray-500 text-white">
                    {initials}
                </div>
            )}
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate max-w-[80px]">
                {seller.name}
            </span>
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
                        className="w-5 h-5 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    />
                ) : (
                    <div
                        key={key}
                        className="avatar-sm bg-gray-500 dark:bg-gray-600 text-white ring-2 ring-white dark:ring-gray-800 border border-gray-200 dark:border-gray-600"
                        title={a?.name || "Agent"}
                        aria-label={a?.name || "Agent"}
                    >
                        {initials}
                    </div>
                );
            })}

            {agents.length > 3 && (
                <div className="avatar-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800 border border-gray-200 dark:border-gray-600">
                    +{agents.length - 3}
                </div>
            )}
        </div>
    );
}

// Stats component for listing metrics
function ListingStats({ views, inquiries }) {
    return (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{views} views</span>
            </div>
            <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{inquiries} inquiries</span>
            </div>
        </div>
    );
}

function Card({ listing, onView, onShare, onEdit }) {
    const p = listing.property;
    const img = p.image_url ? `/storage/${p.image_url}` : "/placeholder.png";
    const area = p.property_type === "land" ? p.lot_area : p.floor_area;

    return (
        <article className="card-hover property-card group flex flex-col">
            {/* Image & Overlay Actions */}
            <div className="relative">
                <img
                    src={img}
                    alt={p.title}
                    className="property-card-image"
                    onError={(e)=>{e.currentTarget.src="/placeholder.png";}}
                    loading="lazy"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0">
                        <button
                            onClick={onView}
                            className="btn btn-primary text-sm font-semibold"
                        >
                            <Eye className="w-4 h-4" /> View
                        </button>
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="btn btn-secondary text-sm font-semibold"
                            >
                                Edit
                            </button>
                        )}
                    </div>
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
            <div className="card-body flex flex-col gap-2 flex-1 p-0">
                <div className="p-4 pb-2">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-2 min-h-[48px]">
                        {p.title}
                    </h3>

                    {/* Price (Primary Focus) */}
                    <p className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">
                        {currency.format(p.price)}
                    </p>

                    {/* Property Features */}
                    {(p.bedrooms > 0 || p.bathrooms > 0) && (
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {p.bedrooms > 0 && (
                                <span>🛏 {p.bedrooms} bed{p.bedrooms !== 1 ? 's' : ''}</span>
                            )}
                            {p.bathrooms > 0 && (
                                <span>🚿 {p.bathrooms} bath{p.bathrooms !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                    )}

                    {/* Location & Area */}
                    <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 shrink-0 text-green-500 dark:text-green-400" />
                            <span className="line-clamp-1" title={p.address}>
                                {p.address || "Location Unknown"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Ruler className="w-3 h-3 shrink-0 text-gray-400" />
                            <span className="font-semibold">{area ? `${area} sqm` : "Area Unknown"}</span>
                            <span className="text-gray-400">•</span>
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{dayjs(listing.updated_at || listing.created_at).format("MMM D, YYYY")}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <ListingStats views={listing.views} inquiries={listing.inquiries} />
                </div>

                {/* Footer: Metadata & Actions */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <SellerChip seller={listing.seller} />
                    <div className="flex items-center gap-3 shrink-0">
                        <AgentsStack agents={listing.agents} />
                        <button
                            onClick={onShare}
                            className="btn-ghost p-1.5 rounded-full"
                            title="Share Listing"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

// Utility to ensure array is used
const ArrayOf = (arr) => (Array.isArray(arr) ? arr : []);

// Export/Import Controls Component

export default function MyListings({ listings, canCreate = true }) {
    const normalized = useMemo(() => ArrayOf(listings?.data).map(normalizeListing), [listings?.data]);

    // filters/sort/search
    const [status, setStatus] = useState("all");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");

    const filtered = useMemo(() => {
        let arr = [...normalized];

        // Status filter
        if (status !== "all") {
            arr = arr.filter((r) => (r.status || "").toLowerCase() === status);
        }

        // Search filter
        const query = q.trim().toLowerCase();
        if (query) {
            arr = arr.filter((r) => {
                const p = r.property || {};
                const hay = `${p.title || ""} ${p.address || ""} ${r.status || ""} ${p.property_type || ""}`.toLowerCase();
                return hay.includes(query);
            });
        }

        // Sort
        arr.sort((a, b) => {
            if (sort === "price_asc") return (a.property.price ?? Infinity) - (b.property.price ?? Infinity);
            if (sort === "price_desc") return (b.property.price ?? -Infinity) - (a.property.price ?? -Infinity);
            if (sort === "views") return (b.views || 0) - (a.views || 0);
            if (sort === "inquiries") return (b.inquiries || 0) - (a.inquiries || 0);
            // newest by created_at
            const A = new Date(a.created_at || 0).valueOf();
            const B = new Date(b.created_at || 0).valueOf();
            return B - A;
        });

        return arr;
    }, [normalized, status, q, sort]);

    // Share helper
    async function shareListing(listing) {
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

    // Bulk actions
    const handleExport = () => {
        console.log("Export listings");
    };

    const handleImport = () => {
        console.log("Import listings");
    };

    const handleCreate = () => {
        router.visit(route('agents.listings.create'));
    };

    // Counts for tabs
    const counts = useMemo(() => {
        const c = { all: normalized.length, assigned: 0, published: 0, sold: 0, draft: 0 };
        normalized.forEach((r) => {
            const s = (r.status || "").toLowerCase();
            if (s === "assigned") c.assigned++;
            else if (s === "sold") c.sold++;
            else if (s === "draft") c.draft++;
            else c.published++;
        });
        return c;
    }, [normalized]);

    // Summary stats
    const summaryStats = useMemo(() => {
        return {
            totalValue: normalized.reduce((sum, listing) => sum + (listing.property?.price || 0), 0),
            totalViews: normalized.reduce((sum, listing) => sum + (listing.views || 0), 0),
            totalInquiries: normalized.reduce((sum, listing) => sum + (listing.inquiries || 0), 0),
        };
    }, [normalized]);

    return (
        <AuthenticatedLayout>
            <div className="page-content space-y-8">
                {/* --- Header --- */}
                <div className="section-header">
                    <div>
                        <h1 className="section-title">My Listings</h1>
                        <p className="section-description">
                            Manage and track properties you are responsible for.
                        </p>
                    </div>

                </div>


                {/* --- Controls / Filter Panel --- */}
                <div className="card p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                        {/* Status Tabs */}
                        <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1 shrink-0 overflow-x-auto">
                            {[
                                ["all", "All"],
                                ["assigned", "Assigned"],
                                ["published", "Published"],
                                ["draft", "Draft"],
                                ["sold", "Sold"],
                            ].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setStatus(val)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-200 whitespace-nowrap",
                                        status === val
                                            ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md ring-1 ring-gray-200 dark:ring-gray-600"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    {label} <span className="opacity-70">({counts[val] || 0})</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1" />

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-2 rounded-md transition",
                                    viewMode === "grid"
                                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-2 rounded-md transition",
                                    viewMode === "list"
                                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                List
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-[260px] shrink-0">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search title or address…"
                                className="form-input pl-9"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative inline-flex items-center shrink-0">
                            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="form-select pl-8 pr-8 cursor-pointer"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="views">Most Views</option>
                                <option value="inquiries">Most Inquiries</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-3 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* --- Listings Grid/List --- */}
                {filtered.length === 0 ? (
                    <div className="card text-center py-12">
                        <Home className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">No Listings Found</h3>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Adjust your filters or create a new listing.</p>
                        {canCreate && (
                            <button
                                onClick={handleCreate}
                                className="btn btn-primary mt-4"
                            >
                                <Plus className="w-4 h-4" />
                                Create Your First Listing
                            </button>
                        )}
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid-properties">
                        {filtered.map((listing) => (
                            <Card
                                key={listing.id}
                                listing={listing}
                                onView={() => router.visit(route('agents.my-listings.show', listing.id))}
                                onEdit={canCreate ? () => router.visit(route('agents.listings.edit', listing.id)) : undefined}
                                onShare={() => shareListing(listing)}
                            />
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="space-y-4">
                        {filtered.map((listing) => (
                            <div
                                key={listing.id}
                                className="card-hover p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={listing.property.image_url ? `/storage/${listing.property.image_url}` : "/placeholder.png"}
                                        alt={listing.property.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {listing.property.title}
                                            </h3>
                                            <TypeBadge type={listing.property.property_type} />
                                            <StatusBadge status={listing.status} />
                                        </div>
                                        <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                                            {currency.format(listing.property.price)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {listing.property.address}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.visit(route('agents.my-listings.show', listing.id))}
                                            className="btn btn-primary btn-sm"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => shareListing(listing)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
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
        </AuthenticatedLayout>
    );
}
