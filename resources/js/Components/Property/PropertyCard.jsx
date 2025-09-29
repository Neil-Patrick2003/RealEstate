import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import PropTypes from "prop-types";
import { Camera, Scale, DoorClosed, Bed, Bath, Repeat2, Share2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";

// --- tiny safety helpers ---
const A = (v) => (Array.isArray(v) ? v : []);
const S = (v) => (typeof v === "string" ? v : "");
const includesSafe = (src, needle) =>
    Array.isArray(src) ? src.includes(needle) : typeof src === "string" ? src.includes(String(needle)) : false;

export default function PropertyListItem({ property, favoriteIds = [], toggleFavorite }) {
    // Formatters
    const formatToPHP = (amount, withDecimals = false) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        }).format(Number(amount ?? 0));

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const daysSince = (dateString) => {
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return Infinity;
        return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    };



    // Derivations
    const imgSrc = property?.image_url ? `/storage/${property.image_url}` : "/images/placeholder.jpg";
    const imagesCount = A(property?.images).length;
    const statusText = property?.isPresell ? "Pre-Selling" : "For Sale";
    const areaText = property?.lot_area
        ? `${property.lot_area} sqm`
        : property?.floor_area
            ? `${property.floor_area} sqm`
            : "N/A";
    const priceText = property?.price != null ? formatToPHP(property.price) : "Price N/A";
    const isNew = daysSince(property?.created_at) <= 14;
    const isFavorite = useMemo(() => includesSafe(favoriteIds, property?.id), [favoriteIds, property?.id]);

    // Share / Copy link
    const [shared, setShared] = useState(false);
    const onShare = async () => {
        try {
            const url = `${window.location.origin}/properties/${property?.id}`;
            if (navigator.share) {
                await navigator.share({ title: S(property?.title) || "Property", url });
                setShared(true);
            } else {
                await navigator.clipboard.writeText(url);
                setShared(true);
            }
            setTimeout(() => setShared(false), 1500);
        } catch {
            // noop
        }
    };

    return (
        <article
            className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-shadow flex flex-col"
            aria-label={property?.title || "Property"}
        >
            {/* Image / Badges */}
            <Link href={`/properties/${property?.id}`} className="relative block group">
                <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        src={imgSrc}
                        alt={S(property?.title) || "Property image"}
                        onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                {/* overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* left/bottom chips */}
                <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white/85 dark:bg-black/50 text-gray-800 dark:text-gray-100 backdrop-blur">
            {statusText}
          </span>
                    {isNew && <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 text-white">New</span>}
                </div>

                {/* right/top chips */}
                <div className="absolute right-3 top-3 flex items-center gap-2">
                    {imagesCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
              <Camera className="h-4 w-4" />
                            {imagesCount}
            </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-[1.05rem] leading-tight line-clamp-1">
                    {S(property?.title) || "Untitled Property"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">
                    {S(property?.address) || "Address unavailable"}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Added: {formatDate(property?.created_at)}</p>

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

                    <div className="flex items-center gap-1.5">
                        {/* Compare (hook up later if you want) */}
                        <button
                            type="button"
                            aria-label="Compare"
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Compare"
                        >
                            <Repeat2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Share */}
                        <button
                            type="button"
                            onClick={onShare}
                            aria-label="Share link"
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title={shared ? "Copied!" : "Share"}
                        >
                            <Share2 className={`w-5 h-5 ${shared ? "text-emerald-600" : "text-gray-600 dark:text-gray-300"}`} />
                        </button>

                        {/* Favorite */}
                        <button
                            type="button"
                            onClick={() => toggleFavorite?.(property?.id)}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-pressed={isFavorite}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            className={`p-2 rounded-full transition-colors ${
                                isFavorite ? "bg-red-100 hover:bg-red-200" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faHeartSolid}
                                className={`w-5 h-5 ${isFavorite ? "text-red-600" : "text-gray-600 dark:text-gray-300"}`}
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
    favoriteIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    toggleFavorite: PropTypes.func.isRequired,
};
