// resources/js/Pages/Agents/MyListings.jsx
import React, { useMemo, useState, useEffect } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import {
    MapPin,
    Share2,
    Eye,
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
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });

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

function TypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const map = {
        house: { icon: Home, cls: "bg-blue-50 text-blue-700 border-blue-200" },
        condo: { icon: Building2, cls: "bg-violet-50 text-violet-700 border-violet-200" },
        land:  { icon: Ruler, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        default:{ icon: Tag, cls: "bg-gray-50 text-gray-700 border-gray-200" },
    };
    const Item = map[t] || map.default;
    const Icon = Item.icon;
    return (
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border", Item.cls)}>
      <Icon className="w-3.5 h-3.5" />
            {type || "Property"}
    </span>
    );
}

function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    if (s === "assigned") {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-600 text-white px-2 py-1 rounded-md">
        <BadgeCheck className="w-3.5 h-3.5" /> Assigned
      </span>
        );
    }
    if (s === "sold") {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded-md">
        <CheckCircle2 className="w-3.5 h-3.5" /> Sold
      </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-700 text-white px-2 py-1 rounded-md">
      <Clock3 className="w-3.5 h-3.5" /> Published
    </span>
    );
}

function SellerChip({ seller }) {
    if (!seller) return null;
    const initials = (seller.name || "?").slice(0, 1).toUpperCase();
    return (
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-white">
            {seller.photo_url ? (
                <img
                    src={`/storage/${seller.photo_url}`}
                    alt={seller.name}
                    className="w-6 h-6 rounded-full object-cover border"
                    onError={(e)=>{e.currentTarget.src="/placeholder.png";}}
                />
            ) : (
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                    {initials}
                </div>
            )}
            <span className="text-xs text-gray-700">{seller.name}</span>
        </div>
    );
}

// Small avatar stack for assigned agents
function AgentsStack({ agents = [] }) {
    if (!Array.isArray(agents) || agents.length === 0) return null;

    return (
        <div className="flex -space-x-2">
            {agents.slice(0, 3).map((a, i) => {
                const key = a?.id ?? i;
                const initials = (a?.name || "?").slice(0, 1).toUpperCase();

                // Prefer photo_url, then avatar_url; fall back to initials
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
                        className="w-7 h-7 rounded-full border object-cover bg-white"
                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    />
                ) : (
                    <div
                        key={key}
                        className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center border"
                        title={a?.name || "Agent"}
                        aria-label={a?.name || "Agent"}
                    >
                        {initials}
                    </div>
                );
            })}

            {agents.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 border flex items-center justify-center text-[11px] text-gray-600">
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
        <article className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
            {/* image */}
            <div className="relative">
                <img
                    src={img}
                    alt={p.title}
                    className="w-full aspect-[16/10] object-cover bg-gray-100"
                    onError={(e)=>{e.currentTarget.src="/placeholder.png";}}
                    loading="lazy"
                />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <TypeBadge type={p.property_type} />
                    <StatusBadge status={listing.status} />
                </div>
                <div className="absolute top-3 right-3">
                    {p.isPresell ? (
                        <span className="text-[11px] font-semibold bg-orange-500 text-white px-2 py-1 rounded-md">Preselling</span>
                    ) : (
                        <span className="text-[11px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded-md">Available</span>
                    )}
                </div>
            </div>

            {/* body */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-gray-900 leading-tight line-clamp-2">{p.title}</h3>
                    <div className="text-right shrink-0">
                        <div className="text-xs text-gray-500">Created</div>
                        <div className="text-xs font-medium text-gray-700">{dayjs(listing.created_at).format("MMM D, YYYY")}</div>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span className="line-clamp-2" title={p.address}>{p.address || "—"}</span>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-emerald-600">{currency.format(p.price)}</p>
                    <div className="text-xs text-gray-700">
                        {area ? `${area} sqm` : "—"}
                    </div>
                </div>

                {/* footer: seller + agents */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <SellerChip seller={listing.seller} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <AgentsStack agents={listing.agents} />
                    </div>
                </div>

                {/* bottom actions for keyboard / mobile */}
                <div className="mt-auto pt-1 flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="flex-1 text-center py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-black"
                    >
                        View Details
                    </button>
                    <button
                        onClick={onShare}
                        className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50"
                        title="Share"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function MyListings({ listings }) {

    // listings is your paginator payload from controller
    const normalized = useMemo(() => (listings?.data || []).map(normalizeListing), [listings?.data]);

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
        const url = `${window.location.origin}/agents/properties/${listing.property.id}`;
        const title = listing.property.title || "Property";
        try {
            if (navigator?.share) {
                await navigator.share({ title, text: listing.property.address || "", url });
                return;
            }
        } catch {}
        try {
            await navigator?.clipboard?.writeText(url);
            alert("Link copied to clipboard");
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
            else c.published++;
        });
        return c;
    }, [normalized]);

    return (
        <AgentLayout>
            <div className="px-4 py-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                    <p className="text-gray-500 text-sm">All properties you’re assigned to or handling.</p>
                </div>

                {/* controls */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
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
                                        "px-4 py-1.5 text-sm",
                                        status === val ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {label} <span className="opacity-70">({counts[val] || 0})</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1" />

                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search title or address…"
                                className="pl-9 pr-3 py-2 text-sm rounded-md bg-gray-100 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:outline-none w-[260px]"
                            />
                        </div>

                        <div className="inline-flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="px-3 py-2 text-sm rounded-md border bg-white"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* grid */}
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">No listings match your filters.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filtered.map((listing) => (
                            <Card
                                key={listing.id}
                                listing={listing}
                                onView={() => router.visit(`/agents/my-listings/${listing.id}`)}
                                onShare={() => shareListing(listing)}
                            />
                        ))}
                    </div>
                )}

                {/* pagination (server-driven) */}
                {Array.isArray(listings?.links) && listings.links.length > 1 && (
                    <div className="flex flex-wrap gap-2 justify-center items-center p-6">
                        {listings.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm border transition",
                                        link.active ? "bg-gray-900 text-white font-semibold" : "bg-white text-gray-700 hover:bg-gray-100"
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
            </div>
        </AgentLayout>
    );
}
