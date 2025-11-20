import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    MapPin,
    Share2,
    Ruler,
    Home,
    Building2,
    LandPlot,
    Heart,
    Camera,
    Eye,
    Sparkles,
    Clock,
    Bath,
    Bed,
    Car,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

// Utility functions
const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
});

const formatPriceShort = (num) => {
    const n = Number(num ?? 0);
    const a = Math.abs(n);
    if (a >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
    if (a >= 1_000) return `₱${(n / 1_000).toFixed(0)}K`;
    return currency.format(n);
};

const truncate = (s, n = 60) => (s?.length > n ? s.slice(0, n - 1) + "…" : s || "");

const daysSince = (dateString) => {
    if (!dateString) return Infinity;
    const ms = Date.now() - new Date(dateString).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// Badge Components
function TypeBadge({ type }) {
    const typeConfig = {
        house: { icon: Home, color: "text-blue-600" },
        condo: { icon: Building2, color: "text-emerald-600" },
        land: { icon: LandPlot, color: "text-amber-600" },
        default: { icon: Home, color: "text-gray-600" },
    };

    const config = typeConfig[type?.toLowerCase()] || typeConfig.default;
    const Icon = config.icon;

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm border border-gray-200 text-xs font-semibold text-gray-700">
            <Icon className={`w-3 h-3 ${config.color}`} />
            {type || "Property"}
        </span>
    );
}

function StatusBadge({ isPresell }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
            isPresell
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
        }`}>
            <Clock className="w-3 h-3" />
            {isPresell ? "Preselling" : "Available"}
        </span>
    );
}

function PropertyImage({ property, isFavorited, onFavorite, imagesCount }) {
    const [imgErr, setImgErr] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    const imgSrc = !imgErr && property?.image_url
        ? `/storage/${property.image_url}`
        : "/placeholder.png";

    const isNew = daysSince(property?.created_at) <= 7;

    const handleFavorite = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onFavorite();
    };

    return (
        <Link
            href={`/properties/${property.id}`}
            className="relative block rounded-t-xl overflow-hidden outline-none group"
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
                        "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                        imgLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                />
            </div>

            {/* Top badges */}
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                <TypeBadge type={property?.property_type} />
                {isNew && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                        <Sparkles className="w-3 h-3" />
                        New
                    </span>
                )}
            </div>

            {/* Top-right actions */}
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                <button
                    onClick={handleFavorite}
                    className={cn(
                        "p-2 rounded-lg backdrop-blur-sm border transition-all duration-300",
                        isFavorited
                            ? "bg-rose-500 border-rose-500 text-white shadow-lg"
                            : "bg-white/95 border-white/60 text-gray-600 hover:bg-white hover:shadow-lg"
                    )}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart className={cn("w-4 h-4", isFavorited ? "fill-current" : "")} />
                </button>

                {imagesCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                        <Camera className="w-3 h-3" />
                        {imagesCount}
                    </span>
                )}
            </div>

            {/* Bottom price */}
            <div className="absolute left-3 right-3 bottom-3 z-10">
                <StatusBadge isPresell={!!property?.isPresell} />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
    );
}

function PropertySpecs({ property }) {
    const specs = [
        { icon: Bed, value: property?.bedrooms,  show: property?.bedrooms > 0 },
        { icon: Bath, value: property?.bathrooms, show: property?.bathrooms > 0 },
        { icon: Car, value: property?.car_slots, show: property?.car_slots > 0 },
        {
            icon: Ruler,
            value: property?.property_type?.toLowerCase() === "land" ? property?.lot_area : property?.floor_area,
            label: "sqm",
            show: true
        },
    ].filter(spec => spec.show);

    if (specs.length === 0) return null;

    return (
        <div className="flex items-center gap-3 mb-3">
            {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <spec.icon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{spec.value || 0} {spec.label}</span>
                </div>
            ))}
        </div>
    );
}

function PropertyFeatures({ features }) {
    const featureList = useMemo(() => {
        const list = features ?? [];
        return list.slice(0, 2); // Show only 2 features max
    }, [features]);

    if (featureList.length === 0) return null;

    return (
        <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
                {featureList.map((feature, index) => (
                    <span
                        key={index}
                        className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                    >
                        {String(feature).replace(/^./, c => c.toUpperCase())}
                    </span>
                ))}
            </div>
        </div>
    );
}

// Main Component
export default function PropertyCard({
                                         property = {},
                                         onShare = () => {},
                                         onToggleFavorite = () => {},
                                         isFavorite = false,
                                         favoriteIds = [],
                                         toggleFavorite,
                                     }) {
    const isFavorited = favoriteIds?.includes(property?.id) || isFavorite;
    const imagesCount = Array.isArray(property?.images) ? property.images.length : 0;

    const handleFavorite = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (toggleFavorite && property?.id) {
            toggleFavorite(property.id);
        } else {
            onToggleFavorite(property);
        }
    };

    const handleShare = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        onShare(property);
    };

    return (
        <article className="card-hover property-card group animate-fade-in h-full flex flex-col">
            {/* Media Section */}
            <PropertyImage
                property={property}
                isFavorited={isFavorited}
                onFavorite={handleFavorite}
                imagesCount={imagesCount}
            />

            {/* Content Section - Compact */}
            <div className="flex-1 p-4 flex flex-col">
                {/* Title - Single line */}
                <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2 line-clamp-1 hover:text-primary-600 transition-colors">
                    <Link href={`/properties/${property.id}`} className="focus:outline-none focus:ring-2 focus:ring-primary-200 rounded">
                        {property?.title || "Untitled Property"}
                    </Link>
                </h3>

                {/* Address - Single line */}
                <div className="flex items-start gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600 line-clamp-1 flex-1">
                        {property?.address || "Address not available"}
                    </span>
                </div>

                {/* Specs */}
                <PropertySpecs property={property} />

                {/* Features */}
                <PropertyFeatures features={property?.features} />

                {/* Description - Very short */}
                {property?.description && (
                    <p
                        className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2 flex-1"
                        dangerouslySetInnerHTML={{ __html: truncate(property.description, 80) }}
                    ></p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
                    <Link
                        href={`/properties/${property.id}`}
                        className="btn-primary btn-sm inline-flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Details
                    </Link>

                    <button
                        onClick={handleShare}
                        className="btn-ghost btn-sm p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Share property"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}
