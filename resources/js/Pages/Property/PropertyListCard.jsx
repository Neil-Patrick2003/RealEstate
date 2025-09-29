import React from "react";
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
} from "lucide-react";

export default function PropertyListItem({
                                             property,
                                             isFavorite = false,
                                             onToggleFavorite = () => {},
                                             onCompare = () => {},
                                         }) {
    // ---- helpers ----
    const formatToPHP = (amount, withDecimals = false) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        }).format(Number(amount ?? 0));

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const daysSince = (dateString) => {
        if (!dateString) return Infinity;
        const ms = Date.now() - new Date(dateString).getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    };

    const areaText =
        property?.lot_area
            ? `${property.lot_area} sqm`
            : property?.floor_area
                ? `${property.floor_area} sqm`
                : "N/A";

    const imagesCount = property?.images?.length || 0;
    const isNew = daysSince(property?.created_at) <= 14;

    const priceText =
        property?.price != null ? formatToPHP(property.price) : "Price N/A";

    const statusText = property?.isPresell ? "Pre-Selling" : "For Sale";

    const imgSrc = property?.image_url
        ? `/storage/${property.image_url}`
        : "/images/placeholder.jpg";

    return (
        <article
            className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-shadow flex flex-col"
            aria-label={property?.title || "Property"}
        >
            {/* Image */}
            <Link href={`/properties/${property?.id}`} className="relative block group">
                <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        src={imgSrc}
                        alt={property?.title || "Property image"}
                        onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                {/* gradient overlay on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* status chip */}
                <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-white/80 dark:bg-black/50 text-gray-800 dark:text-gray-100 backdrop-blur">
            {statusText}
          </span>
                    {isNew && (
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white">
              New
            </span>
                    )}
                </div>

                {/* image count */}
                {imagesCount > 0 && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
            <Camera className="h-4 w-4" />
                        {imagesCount}
          </span>
                )}
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-[1.05rem] leading-tight line-clamp-1">
                    {property?.title || "Untitled Property"}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">
                    {property?.address || "Address unavailable"}
                </p>

                <p className="text-gray-400 dark:text-gray-500 text-xs">
                    Added: {formatDate(property?.created_at) || "—"}
                </p>

                {/* Specs */}
                <div className="mt-2 mb-3 flex flex-wrap gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <span className="inline-flex items-center gap-1.5" title="Lot/Floor Area">
            <Scale className="w-4 h-4" />
              {areaText}
          </span>
                    <span className="inline-flex items-center gap-1.5" title="Total Rooms">
            <DoorClosed className="w-4 h-4" />
                        {property?.total_rooms ?? "N/A"}
          </span>
                    <span className="inline-flex items-center gap-1.5" title="Bedrooms">
            <Bed className="w-4 h-4" />
                        {property?.bedrooms ?? "N/A"}
          </span>
                    <span className="inline-flex items-center gap-1.5" title="Bathrooms">
            <Bath className="w-4 h-4" />
                        {property?.bathrooms ?? "N/A"}
          </span>
                </div>

                {/* Price + Actions */}
                <div className="mt-auto flex items-center justify-between pt-2">
                    <p className="text-primary font-bold text-lg">{priceText}</p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Compare"
                            onClick={() => onCompare(property)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Compare"
                        >
                            <Repeat2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        <button
                            type="button"
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-pressed={isFavorite}
                            onClick={() => onToggleFavorite(property)}
                            className={`p-2 rounded-full transition-colors ${
                                isFavorite
                                    ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                            }`}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Heart
                                className={`w-5 h-5 ${
                                    isFavorite ? "fill-current" : ""
                                }`}
                            />
                        </button>
                    </div>
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
