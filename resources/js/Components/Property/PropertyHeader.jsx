import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
// Using lucide-react for a cleaner, modern icon set (assuming you can install/use it)
import { MapPin, Tag, Copy, Check, ExternalLink, Share2 } from "lucide-react";

// Fallback for utilities if lucide-react is not preferred:
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faLocationDot, faTag, faCopy, faCheck, faUpRightFromSquare, faShareNodes } from "@fortawesome/free-solid-svg-icons";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function PropertyHeader({
                                           title,
                                           address,
                                           isPresell = false,
                                           coordinates = null,
                                           onShare,
                                       }) {
    // Normalize presell flag
    const presell =
        typeof isPresell === "boolean"
            ? isPresell
            : isPresell === 1 || isPresell === "1";

    const status = presell ? "Pre-Selling" : "For Sale";
    const chipClasses = presell
        ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    // **FIXED & MODERNIZED LOGIC FOR GMAPS URL**
    const gmapsUrl = useMemo(() => {
        let lat = null;
        let lng = null;

        if (coordinates) {
            // Check for object format { lat, lng }
            if (typeof coordinates?.lat !== "undefined" && typeof coordinates?.lng !== "undefined") {
                lat = parseFloat(coordinates.lat);
                lng = parseFloat(coordinates.lng);
            }
            // Check for array format [lat, lng]
            else if (Array.isArray(coordinates) && coordinates.length >= 2) {
                lat = parseFloat(coordinates[0]);
                lng = parseFloat(coordinates[1]);
            }
        }

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            // Standard Google Maps URL for coordinates
            return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }

        if (address) {
            // Standard Google Maps URL for address search
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        }

        return null;
    }, [coordinates, address]);

    const [copied, setCopied] = useState(false);

    // Modernized copy function
    const copyAddress = async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500); // Increased duration
        } catch {/* noop */}
    };

    // --- ENHANCED JSX STRUCTURE AND STYLING ---
    return (
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
            {/* Left: Title + Address */}
            <div className="min-w-0 flex-1">
                {/* Status Chip (Moved to be the first element on small screens) */}
                <div className="sm:hidden mb-2">
                     <span className={cn(
                         "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide",
                         chipClasses
                     )}>
                        <Tag className="w-3 h-3" />
                         {status}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 leading-tight line-clamp-2">
                    {title || "Untitled Property"}
                </h1>

                {/* Address and Utility Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600">
                    <span className="inline-flex items-center gap-2 font-medium">
                        <MapPin className="w-5 h-5 text-primary-dark" />
                        <span className="truncate max-w-[calc(100vw-8rem)] sm:max-w-full">
                            {address || "Address unavailable"}
                        </span>
                    </span>

                    {/* Separator and Utility Buttons */}
                    <div className="flex items-center gap-3 sm:pl-3 sm:border-l sm:border-gray-200">

                        {/* 1. Map Link */}
                        {gmapsUrl && (
                            <a
                                href={gmapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 transition-colors"
                                title="View on Map"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span className="hidden sm:inline">Map</span>
                            </a>
                        )}

                        {/* 2. Copy Button */}
                        {address && (
                            <button
                                type="button"
                                onClick={copyAddress}
                                className={cn(
                                    "text-sm font-semibold inline-flex items-center gap-1 transition-colors",
                                    copied ? "text-emerald-600" : "text-gray-700 hover:text-gray-900"
                                )}
                                title={copied ? "Copied!" : "Copy address"}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="sr-only sm:not-sr-only">{copied ? "Copied!" : "Copy Link"}</span>
                            </button>
                        )}

                    </div>
                </div>
            </div>

            {/* Right: Status chip (Hidden on small screens, shown next to title on large) */}
            <div className="shrink-0 hidden sm:block">
                 <span className={cn(
                     "inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold tracking-wide shadow-sm",
                     chipClasses
                 )}>
                    <Tag className="w-4 h-4" />
                     {status}
                </span>
            </div>
        </header>
    );
}

PropertyHeader.propTypes = {
    title: PropTypes.string,
    address: PropTypes.string,
    isPresell: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    coordinates: PropTypes.oneOfType([
        PropTypes.shape({ lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    ]),
    onShare: PropTypes.func,
};
