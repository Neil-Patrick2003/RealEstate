import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faTag,
    faCopy,
    faCheck,
    faUpRightFromSquare,
    faShareNodes,
} from "@fortawesome/free-solid-svg-icons";

export default function PropertyHeader({
                                           title,
                                           address,
                                           isPresell = false,
                                           coordinates = null, // optional: { lat, lng } or [lat, lng]
                                           onShare,            // optional: custom share handler
                                       }) {
    // normalize presell flag (0/1/"1"/true/false)
    const presell =
        typeof isPresell === "boolean"
            ? isPresell
            : isPresell === 1 || isPresell === "1";

    const status = presell ? "Pre-Selling" : "For Sale";
    const chipClasses = presell
        ? "bg-orange-100 text-orange-700 ring-1 ring-orange-200"
        : "bg-green-100 text-green-700 ring-1 ring-green-200";

    const gmapsUrl = useMemo(() => {
        if (coordinates) {
            const lat =
                typeof coordinates?.lat !== "undefined"
                    ? parseFloat(coordinates.lat)
                    : Array.isArray(coordinates) ? parseFloat(coordinates[0]) : null;
            const lng =
                typeof coordinates?.lng !== "undefined"
                    ? parseFloat(coordinates.lng)
                    : Array.isArray(coordinates) ? parseFloat(coordinates[1]) : null;
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            }
        }
        if (address) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        }
        return null;
    }, [coordinates, address]);

    const [copied, setCopied] = useState(false);
    const copyAddress = async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {/* noop */}
    };

    const handleShare = async () => {
        if (onShare) return onShare();
        // best-effort generic share
        try {
            if (navigator.share) {
                await navigator.share({ title: title || "Property", text: address || "" });
            } else if (address) {
                await navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            }
        } catch {/* noop */}
    };

    return (
        <header className="flex-center-between flex items-start justify-between gap-3 flex-wrap">
            {/* Left: Title + Address */}
            <div className="min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-1 line-clamp-2">
                    {title || "Untitled Property"}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-gray-600">
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-primary" />
            <span className="truncate max-w-[60ch]">{address || "Address unavailable"}</span>
          </span>

                    {/* actions */}
                    <div className="inline-flex items-center gap-2 pl-2">
                        {gmapsUrl && (
                            <a
                                href={gmapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                                title="View on Map"
                            >
                                <FontAwesomeIcon icon={faUpRightFromSquare} />
                                <span className="sr-only">View on Map</span>
                            </a>
                        )}
                        {address && (
                            <button
                                type="button"
                                onClick={copyAddress}
                                className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                                title={copied ? "Copied!" : "Copy address"}
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                                <span className="sr-only">Copy address</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleShare}
                            className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                            title="Share"
                        >
                            <FontAwesomeIcon icon={faShareNodes} />
                            <span className="sr-only">Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Status chip */}
            <div className="shrink-0">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${chipClasses}`}>
          <FontAwesomeIcon icon={faTag} />
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
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])), // [lat, lng] or [lng, lat] — we handle both defensively
    ]),
    onShare: PropTypes.func,
};
