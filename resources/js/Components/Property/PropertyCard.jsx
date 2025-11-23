import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    MapPin,
    Ruler,
    Home,
    Building2,
    LandPlot,
    Heart,
    Camera,
    Sparkles,
    Clock,
    Bath,
    Bed,
    Car,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

// Utils
const formatPriceShort = (num) => {
    const n = Number(num ?? 0);
    const a = Math.abs(n);
    if (a >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
    if (a >= 1_000) return `₱${(n / 1_000).toFixed(0)}K`;
    return `₱${n?.toLocaleString()}`;
};

const truncateHTML = (html, maxLength = 100) => {
    if (!html) return "";

    // Remove HTML tags
    const text = html.replace(/<[^>]+>/g, "");

    if (text.length <= maxLength) return html; // Keep original HTML if short enough

    return text.substring(0, maxLength) + "…";
};
const daysSince = (dateString) => {
    if (!dateString) return Infinity;
    const ms = Date.now() - new Date(dateString).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// Badges
function TypeBadge({ type }) {
    const typeConfig = {
        house: { icon: Home, color: "text-blue-600 bg-blue-50 border-blue-200" },
        condo: { icon: Building2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
        land: { icon: LandPlot, color: "text-amber-600 bg-amber-50 border-amber-200" },
        default: { icon: Home, color: "text-gray-600 bg-gray-50 border-gray-200" },
    };

    const config = typeConfig[type?.toLowerCase()] || typeConfig.default;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            {type || "Property"}
        </span>
    );
}

function StatusBadge({ isPresell }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPresell
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
            <Clock className="w-3 h-3" />
            {isPresell ? "Pre-selling" : "Available"}
        </span>
    );
}

// Main Component
export default function PropertyCard({
                                         property,
                                         onToggleFavorite,
                                         isFavorite = false,
                                     }) {
    const imagesCount = Array.isArray(property?.images) ? property.images.length : 0;
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

    // Handle favorite click
    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setLocalIsFavorite(!localIsFavorite);
        if (onToggleFavorite) {
            onToggleFavorite(property.id);
        }
    };

    const isNew = daysSince(property?.created_at) <= 7;

    return (
        <article className="group bg-white   transition-all duration-300 overflow-hidden">
            {/* Image Section - Reduced height */}
            <div className="relative aspect-[4/3] bg-gray-100">
                <Link
                    href={`/properties/${property.id}`}
                    className="block w-full h-full outline-none"
                >
                    <img
                        src={property.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                        className="w-full h-full object-cover  transition-transform duration-300 "
                        alt={property.title}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                {/* Top badges */}
                <div className="absolute left-3 top-3 flex   gap-2">
                    <TypeBadge type={property?.property_type} />
                    {isNew && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-green-700 text-xs font-medium border border-green-200">
                            <Sparkles className="w-3 h-3" />
                            New
                        </span>
                    )}
                </div>

                {/* Image count badge */}
                {imagesCount > 0 && (
                    <div className="absolute right-3 top-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 text-white text-xs font-medium backdrop-blur-sm">
                            <Camera className="w-3 h-3" />
                            {imagesCount}
                        </span>
                    </div>
                )}

                {/* Favorite button */}
                <button
                    onClick={handleFavoriteClick}
                    className={`absolute right-3 bottom-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                        localIsFavorite
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
                    }`}
                    aria-label={localIsFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart
                        className={`w-4 h-4 transition-all ${
                            localIsFavorite ? 'fill-current' : ''
                        }`}
                    />
                </button>
            </div>

            {/* Content Section - Compact layout */}
            <div className="p-4">
                {/* Header with price */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            <Link href={`/properties/${property.id}`} className="hover:underline">
                                {property.title}
                            </Link>
                        </h3>

                        <div className="flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">{property.address}</span>
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-gray-900 mb-1">
                            {formatPriceShort(property.price)}
                        </div>
                        <StatusBadge isPresell={!!property?.is_presell} />
                    </div>
                </div>

                {/* Compact description */}
                <p
                    className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2"
                    dangerouslySetInnerHTML={{
                        __html: truncateHTML(property.description, 100)
                    }}
                ></p>

                {/* Property Features - Compact grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {property.bedrooms > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Bed className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{property.bedrooms}</span>
                            <span className="text-gray-500">Beds</span>
                        </div>
                    )}
                    {property.bathrooms > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Bath className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{property.bathrooms}</span>
                            <span className="text-gray-500">Baths</span>
                        </div>
                    )}
                    {property.car_slots > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Car className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{property.car_slots}</span>
                            <span className="text-gray-500">Cars</span>
                        </div>
                    )}
                    {property.floor_area > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Ruler className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{property.floor_area}</span>
                            <span className="text-gray-500">sqm</span>
                        </div>
                    )}
                </div>

                {/* Additional info - Very compact */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                    {property.year_built && (
                        <span>Built {property.year_built}</span>
                    )}
                    {property.created_at && (
                        <span>Listed {daysSince(property.created_at)}d ago</span>
                    )}
                </div>
            </div>
        </article>
    );
}
