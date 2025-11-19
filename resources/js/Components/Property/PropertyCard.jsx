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
    Eye,
    Sparkles,
    Clock,
    Bath,
    Bed,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

// Utility functions
const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
});

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

// Badge Components
function TypeBadge({ type }) {
    const typeConfig = {
        house: {
            icon: Home,
            badgeClass: "badge-primary",
            gradient: "from-primary-400 to-primary-600"
        },
        condo: {
            icon: Building2,
            badgeClass: "badge-accent",
            gradient: "from-emerald-400 to-cyan-500"
        },
        land: {
            icon: LandPlot,
            badgeClass: "badge-success",
            gradient: "from-emerald-500 to-green-600"
        },
        default: {
            icon: Star,
            badgeClass: "badge-gray",
            gradient: "from-gray-400 to-gray-600"
        },
    };

    const config = typeConfig[type?.toLowerCase()] || typeConfig.default;
    const Icon = config.icon;

    return (
        <span className={cn("badge", config.badgeClass)}>
            <div className={cn("p-1 rounded-lg bg-gradient-to-br", config.gradient)}>
                <Icon className="w-3 h-3 text-white" />
            </div>
            {type || "Property"}
        </span>
    );
}

function PresellRibbon({ isPresell }) {
    return (
        <span className={cn("badge", isPresell ? "badge-warning" : "badge-success")}>
            {isPresell ? (
                <>
                    <Clock className="w-3 h-3" />
                    Preselling
                </>
            ) : (
                <>
                    <Sparkles className="w-3 h-3" />
                    Available
                </>
            )}
        </span>
    );
}

function AreaChip({ property }) {
    const area = property?.property_type?.toLowerCase() === "land"
        ? property?.lot_area
        : property?.floor_area;

    return (
        <span className="badge badge-gray">
            <div className="p-1 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600">
                <Ruler className="w-3 h-3 text-white" />
            </div>
            {area ? `${area} sqm` : "N/A"}
        </span>
    );
}

function PropertyImage({ property, isFavorited, onFavorite, onShare, imagesCount }) {
    const [imgErr, setImgErr] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    const imgSrc = !imgErr && property?.image_url
        ? `/storage/${property.image_url}`
        : "/placeholder.png";

    const isNew = daysSince(property?.created_at) <= 14;

    const handleFavorite = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onFavorite();
    };

    const handleShare = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onShare();
    };

    return (
        <Link
            href={`/properties/${property.id}`}
            className="relative block rounded-t-lg overflow-hidden outline-none group"
        >
            <div className="w-full aspect-[16/11] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
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
                        "property-card-image w-full h-full object-cover",
                        imgLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {/* Top-left badges */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                <TypeBadge type={property?.property_type} />
                {isNew && (
                    <span className="badge badge-success">
                        <Sparkles className="w-3 h-3" />
                        New
                    </span>
                )}
            </div>

            {/* Top-right counters */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                {imagesCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-lg text-white text-xs font-medium border border-white/20">
                        <Camera className="h-3.5 w-3.5" />
                        {imagesCount}
                    </span>
                )}


            </div>

            {/* Status + price */}
            <div className="absolute left-4 right-4 bottom-4 z-10 flex items-center justify-between">
                <PresellRibbon isPresell={!!property?.isPresell} />
                <span className="inline-flex px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-lg text-gray-900 text-sm font-bold shadow-soft border border-white/60">
                    {formatPriceShort(Number(property?.price ?? 0))}
                </span>
            </div>

            {/* Hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Link>
    );
}

function PropertySpecs({ property }) {
    return (
        <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2">
                {property?.bedrooms > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50/80 text-primary-700 text-sm font-semibold border border-primary-200/60">
                        <Bed className="w-3.5 h-3.5" />
                        {property.bedrooms} BR
                    </span>
                )}
                {property?.bathrooms > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 text-emerald-700 text-sm font-semibold border border-emerald-200/60">
                        <Bath className="w-3.5 h-3.5" />
                        {property.bathrooms} BA
                    </span>
                )}
            </div>
            <AreaChip property={property} />
        </div>
    );
}

function PropertyFeatures({ features }) {
    const featureList = useMemo(() => {
        const list = features ?? [];
        return { show: list.slice(0, 3), extra: Math.max(0, list.length - 3) };
    }, [features]);

    if (featureList.show.length === 0) return null;

    return (
        <div className="mb-4">
            <div className="flex flex-wrap gap-2">
                {featureList.show.map((feature, index) => (
                    <span key={index} className="badge badge-gray text-xs">
                        {String(feature).replace(/^./, (c) => c.toUpperCase())}
                    </span>
                ))}
                {featureList.extra > 0 && (
                    <span className="badge badge-primary text-xs">
                        +{featureList.extra} more
                    </span>
                )}
            </div>
        </div>
    );
}

function PropertyActions({
                             property,
                             isFavorited,
                             onFavorite,
                             onShare,
                             onView,
                             showMobileActions = false
                         }) {
    const handleViewDetails = (e) => {
        e.stopPropagation();
        onView?.(property);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        onFavorite();
    };

    const handleShare = (e) => {
        e.stopPropagation();
        onShare();
    };

    if (showMobileActions) {
        return (
            <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                    onClick={handleFavorite}
                    className={cn(
                        "btn-outline text-sm py-2.5 rounded-xl transition-all duration-300",
                        isFavorited
                            ? "border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100/50"
                            : "hover:border-gray-300"
                    )}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFavorited}
                >
                    <Heart className={cn("w-4 h-4 transition-all", isFavorited ? "fill-current scale-110" : "")} />
                    {isFavorited ? "Saved" : "Save"}
                </button>
                <button
                    onClick={handleShare}
                    className="btn-outline text-sm py-2.5 rounded-xl hover:border-gray-300 transition-all duration-300"
                    aria-label="Share property"
                >
                    <Share2 className="w-4 h-4" /> Share
                </button>
            </div>
        );
    }

    return (
        <div className="mt-auto flex items-center justify-between">
            <Link
                href={`/properties/${property.id}`}
                onClick={handleViewDetails}
                className="btn-primary text-sm py-3 px-6 rounded-xl"
            >
                <Eye className="w-4 h-4" />
                View Details
            </Link>

            <div className="hidden sm:flex items-center gap-1">
                <button
                    onClick={handleFavorite}
                    className={cn(
                        "btn-ghost p-2.5 rounded-xl transition-all duration-300",
                        isFavorited
                            ? "text-rose-500 bg-rose-50/80 hover:bg-rose-100/80 shadow-sm"
                            : "hover:bg-gray-100/80"
                    )}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFavorited}
                    title="Toggle favorite"
                >
                    <Heart className={cn("h-4 w-4 transition-all", isFavorited ? "fill-current scale-110" : "")} />
                </button>
                <button
                    onClick={handleShare}
                    className="btn-ghost p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-300"
                    aria-label="Share property"
                    title="Share property"
                >
                    <Share2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// Main Component
export default function PropertyCard({
                                         property = {},
                                         onView,
                                         onInquiry,
                                         onShare = () => {},
                                         onToggleFavorite = () => {},
                                         isFavorite = false,
                                         favoriteIds = [],
                                         toggleFavorite,
                                     }) {
    const isFavorited = favoriteIds?.includes(property?.id) || isFavorite;
    const imagesCount = Array.isArray(property?.images) ? property.images.length : 0;
    const priceDisplay = formatPriceShort(Number(property?.price ?? 0));

    const handleFavorite = () => {
        if (toggleFavorite && property?.id) {
            toggleFavorite(property.id);
        } else {
            onToggleFavorite(property);
        }
    };

    const handleShare = () => {
        onShare(property);
    };

    const handleView = () => {
        onView?.(property);
    };

    return (
        <article
            className="property-card group animate-fade-in"
            tabIndex={-1}
            aria-label={property?.title || "Property"}
        >
            {/* Media Section */}
            <PropertyImage
                property={property}
                isFavorited={isFavorited}
                onFavorite={handleFavorite}
                onShare={handleShare}
                imagesCount={imagesCount}
            />

            {/* Content Section */}
            <div className="property-card-content">
                {/* Specs */}
                <PropertySpecs property={property} />

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 hover:text-primary-600 transition-colors duration-300 line-clamp-2">
                    <Link
                        href={`/properties/${property.id}`}
                        className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
                    >
                        {truncate(property?.title, 72)}
                    </Link>
                </h3>

                {/* Address */}
                <p className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 shrink-0 text-primary-500 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed" title={property?.address}>
                        {property?.address || "Address not available"}
                    </span>
                </p>

                {/* Mobile Price Display */}
                <div className="sm:hidden text-lg font-bold bg-gradient-to-r from-primary-500 to-emerald-600 bg-clip-text text-transparent mb-4">
                    {priceDisplay}
                </div>

                {/* Features */}
                <PropertyFeatures features={property?.features} />

                {/* Description (truncated) */}
                {property?.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                        {truncate(property.description, 120)}
                    </p>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent my-4" />

                {/* Actions */}
                <PropertyActions
                    property={property}
                    isFavorited={isFavorited}
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                    onView={handleView}
                />
            </div>
        </article>
    );
}
