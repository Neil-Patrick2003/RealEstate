import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    MapPin,
    Share2,
    Ruler,
    Home,
    Building2,
    LandPlot,
    Star,
    Heart,
    Camera,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

// Standard ₱ formatter
const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
});

// ₱ short format (K/M)
const formatPriceShort = (num) => {
    const n = Number(num ?? 0);
    const a = Math.abs(n);
    if (a >= 1_000_000) return `₱${(n / 1_000_000).toFixed(2)}M`;
    if (a >= 1_000) return `₱${(n / 1_000).toFixed(2)}K`;
    return currency.format(n);
};

const truncate = (s, n = 72) => (s?.length > n ? s.slice(0, n - 1) + "…" : s || "—");

const daysSince = (dateString) => {
    if (!dateString) return Infinity;
    const ms = Date.now() - new Date(dateString).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

function TypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const map = {
        house: { icon: Home, cls: "bg-blue-600 text-white" },
        condo: { icon: Building2, cls: "bg-violet-600 text-white" },
        land: { icon: LandPlot, cls: "bg-emerald-600 text-white" },
        default: { icon: Star, cls: "bg-gray-700 text-white" },
    };
    const Item = map[t] || map.default;
    const Icon = Item.icon;
    return (
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full shadow", Item.cls)}>
      <Icon className="w-3.5 h-3.5" />
            {type || "Property"}
    </span>
    );
}

function PresellRibbon({ isPresell }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full shadow-lg",
                isPresell ? "bg-orange-500 text-white" : "bg-green-600 text-white"
            )}
        >
      {isPresell ? "Preselling" : "Available"}
    </span>
    );
}

function AreaChip({ property }) {
    const area =
        (property?.property_type?.toLowerCase() === "land" ? property?.lot_area : property?.floor_area) ?? null;
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full shrink-0">
      <Ruler className="w-3 h-3" />
            {area ? `${area} sqm` : "N/A"}
    </span>
    );
}

export default function PropertyCard({
                                         property = {},
                                         onView, // optional
                                         onInquiry, // optional
                                         onShare = () => {}, // optional
                                         onToggleFavorite = () => {},
                                         isFavorite = false,
                                     }) {


    const [imgErr, setImgErr] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    const imgSrc =
        !imgErr && property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png";

    const features = useMemo(() => {
        const list = property?.features ?? [];
        return { show: list.slice(0, 2), extra: Math.max(0, list.length - 2) };
    }, [property?.features]);

    const priceDisplay = formatPriceShort(Number(property?.price ?? 0));
    const isPresell = !!(typeof property.isPresell === "boolean" ? property.isPresell : Number(property.isPresell));
    const isNew = daysSince(property?.created_at) <= 14;
    const imagesCount = Array.isArray(property?.images) ? property.images.length : 0;

    const handleFav = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggleFavorite(property);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onShare(property);
    };

    return (
        <article
            className="
        group relative bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl
        transition-all flex flex-col focus-within:ring-2 focus-within:ring-amber-500
      "
            tabIndex={-1}
            aria-label={property?.title || "Property"}
        >
            {/* Media */}
            <Link href={`/properties/${property.id}`} className="relative block rounded-t-2xl overflow-hidden outline-none">
                <div className="w-full aspect-[16/10] bg-gray-100">
                    {/* skeleton */}
                    {!imgLoaded && (
                        <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <img
                        src={imgSrc}
                        alt={property?.title || "Property image"}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => {
                            setImgErr(true);
                            setImgLoaded(true);
                        }}
                        className={cn(
                            "h-full w-full object-cover transition-transform duration-500",
                            imgLoaded ? "group-hover:scale-[1.03]" : "opacity-0"
                        )}
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                {/* top-left badges */}
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                    <TypeBadge type={property?.property_type} />
                    {isNew && <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow">New</span>}
                </div>

                {/* top-right counters */}
                <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                    {imagesCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
              <Camera className="h-4 w-4" />
                            {imagesCount}
            </span>
                    )}
                </div>

                {/* status + price */}
                <div className="absolute left-4 right-4 bottom-4 z-10 flex items-center justify-between">
                    <PresellRibbon isPresell={isPresell} />
                    <span className="inline-flex px-2.5 py-1.5 rounded-lg bg-white text-gray-900 text-sm font-extrabold shadow-sm">
            {priceDisplay}
          </span>
                </div>

                {/* hover overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Specs/Area + Address */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                        {property?.bedrooms ? (
                            <span className="font-medium text-gray-700">{property.bedrooms} BR</span>
                        ) : null}
                        {property?.bathrooms ? (
                            <span className="font-medium text-gray-700">{property.bathrooms} BA</span>
                        ) : null}
                    </div>
                    <AreaChip property={property} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug hover:text-amber-600 transition">
                    <Link href={`/properties/${property.id}`} className="focus:outline-none focus:ring-2 focus:ring-amber-500 rounded">
                        {truncate(property?.title, 72)}
                    </Link>
                </h3>

                {/* Address */}
                <p className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="line-clamp-1" title={property?.address}>
            {property?.address || "—"}
          </span>
                </p>

                {/* Price row (for small cards where bottom overlay may be out of view) – optional duplicate display */}
                <div className="sm:hidden -mt-1 text-base font-bold text-amber-600">{priceDisplay}</div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mt-1" />

                {/* Actions */}
                <div className="mt-auto flex items-center justify-between">
                    <Link
                        href={`/properties/${property.id}`}
                        className="
              w-full sm:w-auto text-center px-4 py-2.5 bg-secondary text-white rounded-lg
              text-sm font-semibold hover:bg-amber-700 transition shadow-md shadow-amber-200
              focus:outline-none focus:ring-2 focus:ring-amber-500
            "
                    >
                        View Details
                    </Link>

                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={handleFav}
                            className={cn(
                                "p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-amber-500",
                                isFavorite
                                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-200"
                                    : "text-gray-600 border border-gray-200 hover:bg-gray-100"
                            )}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-pressed={isFavorite}
                            title="Toggle favorite"
                        >
                            <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full text-gray-600 border border-gray-200 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
                            aria-label="Share property"
                            title="Share property"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Secondary row (mobile actions) */}
                <div className="sm:hidden grid grid-cols-2 gap-2">
                    <button
                        onClick={handleFav}
                        className={cn(
                            "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                            isFavorite
                                ? "bg-rose-500 text-white hover:bg-rose-600"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        aria-pressed={isFavorite}
                    >
                        <Heart className={cn("w-4 h-4", isFavorite ? "fill-current" : "")} /> Favorite
                    </button>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        aria-label="Share property"
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>

                {/* Optional features preview */}
                {features.show.length > 0 && (
                    <div className="pt-1">
                        <div className="flex flex-wrap gap-1.5">
                            {features.show.map((f, i) => (
                                <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                    {String(f)}
                                </span>
                            ))}
                            {features.extra > 0 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-600">
                                  +{features.extra} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
