import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import PropTypes from "prop-types";
import {
    Camera,
    Scale,
    DoorClosed,
    Bed,
    Bath,
    Repeat2,
    Heart,
    MapPin,
} from "lucide-react";

export default function PropertyListItem({
                                             property,
                                             isFavorite = false,
                                             onToggleFavorite = () => {},
                                             onCompare = () => {},
                                         }) {
    /* ---------------- Helpers ---------------- */
    const formatToPHP = (amount, withDecimals = false) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        }).format(Number(amount ?? 0));

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const daysSince = (dateString) => {
        if (!dateString) return Infinity;
        const ms = Date.now() - new Date(dateString).getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    };

    const imagesCount = property?.images?.length || 0;
    const isNew = daysSince(property?.created_at) <= 14;
    const statusText = property?.isPresell ? "Pre-Selling" : "For Sale";
    const priceText = property?.price != null ? formatToPHP(property.price) : "Price N/A";

    const areaText = useMemo(() => {
        const la = property?.lot_area ? Number(property.lot_area) : 0;
        const fa = property?.floor_area ? Number(property.floor_area) : 0;
        if (la && fa) return `${fa} m² floor • ${la} m² lot`;
        if (la) return `${la} m² lot`;
        if (fa) return `${fa} m² floor`;
        return "—";
    }, [property?.lot_area, property?.floor_area]);

    const specs = useMemo(() => {
        const arr = [];
        if (areaText !== "—") arr.push({ icon: Scale, label: areaText, title: "Area" });
        if (property?.total_rooms != null) arr.push({ icon: DoorClosed, label: property.total_rooms, title: "Total Rooms" });
        if (property?.bedrooms != null) arr.push({ icon: Bed, label: property.bedrooms, title: "Bedrooms" });
        if (property?.bathrooms != null) arr.push({ icon: Bath, label: property.bathrooms, title: "Bathrooms" });
        return arr;
    }, [areaText, property?.total_rooms, property?.bedrooms, property?.bathrooms]);

    const address = property?.address || "";
    const createdAtText = formatDate(property?.created_at) || "—";

    const imgSrc = property?.image_url ? `/storage/${property.image_url}` : "/images/placeholder.jpg";
    const [imgLoaded, setImgLoaded] = useState(false);

    /* ---------------- UI ---------------- */
    return (
        <article
            className="
        group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800
        ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-emerald-200
        transition-all duration-300 flex flex-col focus-within:ring-2 focus-within:ring-emerald-500
      "
            aria-label={property?.title || "Property"}
        >
            {/* Media */}
            <div className="relative">
                <Link href={`/properties/${property?.id}`} className="block outline-none" aria-label={`View ${property?.title ?? "property"}`}>
                    <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {/* soft skeleton */}
                        <div
                            className={`h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse ${
                                imgLoaded ? "hidden" : "block"
                            }`}
                        />
                        <img
                            src={imgSrc}
                            alt={property?.title || "Property image"}
                            onLoad={() => setImgLoaded(true)}
                            onError={(e) => {
                                e.currentTarget.src = "/images/placeholder.jpg";
                                setImgLoaded(true);
                            }}
                            className={`h-full w-full object-cover transition-transform duration-500 ${
                                imgLoaded ? "group-hover:scale-[1.03]" : "opacity-0"
                            }`}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>

                    {/* overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* left badges */}
                    <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/85 dark:bg-black/50 text-gray-900 dark:text-gray-100 backdrop-blur">
              {statusText}
            </span>
                        {isNew && (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white shadow-sm">
                New
              </span>
                        )}
                    </div>

                    {/* top-right counters */}
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                        {imagesCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
                <Camera className="h-4 w-4" />
                                {imagesCount}
              </span>
                        )}
                    </div>

                    {/* price chip */}
                    <div className="absolute right-3 bottom-3">
            <span className="inline-flex px-2.5 py-1.5 rounded-lg bg-white text-gray-900 text-sm font-bold shadow-sm">
              {priceText}
            </span>
                    </div>
                </Link>

                {/* favorite button (floating) */}
                <button
                    type="button"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFavorite}
                    onClick={() => onToggleFavorite(property)}
                    className={`absolute right-3 -bottom-4 translate-y-1/2 md:top-3 md:translate-y-0 md:bottom-auto
                      p-2 rounded-full bg-white/90 backdrop-blur text-red-500 shadow-sm
                      hover:bg-white transition
                      focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="space-y-1">
                    <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-[1.05rem] leading-tight line-clamp-1">
                        {property?.title || "Untitled Property"}
                    </h3>
                    <p className="flex items-start gap-1.5 text-gray-600 dark:text-gray-300 text-sm line-clamp-1">
                        <MapPin className="w-4 h-4 shrink-0 mt-[2px]" />
                        <span>{address || "Address unavailable"}</span>
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">
                        Added: {createdAtText}
                    </p>
                </div>

                {/* Specs */}
                {specs.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-700 dark:text-gray-300 text-[13px]">
                        {specs.map(({ icon: Icon, label, title }, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5" title={title}>
                <Icon className="w-4 h-4" />
                                {label}
              </span>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gray-100 dark:bg-gray-700 mt-1" />

                {/* Actions (compare kept here; price is on image for hierarchy) */}
                <div className="mt-auto flex items-center justify-between">
                    <Link
                        href={`/properties/${property?.id}`}
                        className="
              inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold
              rounded-lg bg-emerald-600 text-white hover:bg-emerald-700
              focus:outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-[40px]
            "
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </article>
    );
}

PropertyListItem.propTypes = {
    property: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        image_url: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.any),
        property_type: PropTypes.string,
        bedrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        bathrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        total_rooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        floor_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        lot_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        isPresell: PropTypes.bool,
        address: PropTypes.string,
        created_at: PropTypes.string,
    }).isRequired,
    isFavorite: PropTypes.bool,
    onToggleFavorite: PropTypes.func,
    onCompare: PropTypes.func,
};
