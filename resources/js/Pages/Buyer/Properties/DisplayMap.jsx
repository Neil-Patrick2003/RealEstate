import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polygon,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "@inertiajs/react";
import { ChevronDown, MapPin, LocateFixed } from "lucide-react";

// --- 1. LEAFLET SETUP & CUSTOM ICONS (External to component) ---

// Fix default Leaflet marker icons pathing
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Define a smaller, custom icon size for better map viewing
const ICON_SIZE = [35, 45];
const ICON_ANCHOR = [17, 45];
const POPUP_ANCHOR = [1, -40];

// Note: These paths assume images exist in the public directory (e.g., /public/icon/house.png)
const createCustomIcon = (url) => new L.Icon({
    iconUrl: url,
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
    shadowUrl: markerShadow,
    shadowSize: [35, 35],
});

const houseIcon = createCustomIcon("/icon/house.png");
const landIcon = createCustomIcon("/icon/land.png");

const getIconByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return landIcon;
        default:
            return houseIcon;
    }
};

// --- 2. HELPERS ---

const FALLBACK_CENTER = [14.5995, 120.9842]; // Manila fallback

// NEW: Function to format large numbers to K or M (e.g., 1,120,000 -> ₱1.12M)
const formatPriceShort = (num) => {
    num = Number(num);
    if (isNaN(num) || num === 0) return "₱0";

    const currencyFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

    const absNum = Math.abs(num);

    if (absNum >= 1000000) {
        return `₱${(num / 1000000).toFixed(2)}M`;
    }
    if (absNum >= 1000) {
        return `₱${(num / 1000).toFixed(2)}K`;
    }
    // Fallback to standard currency format for anything less than 1K
    return currencyFormatter.format(num);
};

const toLatLng = (coord) => {
    // Supports {lat,lng} or [lng,lat]
    if (!coord) return null;
    let lat, lng;

    if (typeof coord?.lat === "number" && typeof coord?.lng === "number") {
        lat = coord.lat;
        lng = coord.lng;
    } else if (Array.isArray(coord) && coord.length >= 2) {
        // Assuming GeoJSON standard [lng, lat] for polygon coordinates
        lng = parseFloat(coord[0]);
        lat = parseFloat(coord[1]);
    } else {
        return null;
    }

    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

const colorByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return "#34d399"; // Emerald
        case "house":
            return "#facc15"; // Amber
        case "condo":
            return "#a78bfa"; // Violet
        default:
            return "#60a5fa"; // Blue
    }
};

// --- 3. CUSTOM MAP CONTROLS (Components must use useMap hook) ---

function FitResultsButton({ bounds }) {
    const map = useMap();
    const fit = () => {
        if (!bounds?.length) return;
        // Pad the bounds by 20% to prevent markers from hugging the edge
        map.fitBounds(L.latLngBounds(bounds).pad(0.2), { animate: true });
    };
    // We add this button to the map's control layer using a custom div structure
    return (
        <button
            type="button"
            onClick={fit}
            className="bg-white/95 backdrop-blur border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-md text-gray-700 hover:bg-gray-100 transition"
            title="Fit to results"
        >
            <ChevronDown className="w-4 h-4 rotate-180" />
        </button>
    );
}

function RecenterButton({ center }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => center && map.setView(center, Math.max(map.getZoom(), 15))}
            className="bg-white/95 backdrop-blur border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-md text-gray-700 hover:bg-gray-100 transition"
            title="Recenter to my location"
        >
            <LocateFixed className="w-4 h-4" />
        </button>
    );
}


// --- 4. DATA PROCESSING ---

// Robustly extracts all map shapes (markers/polygons) and their overall bounds
const useMapData = (properties) => {
    const items = useMemo(() => {
        const out = [];
        (properties || []).forEach((p) => {
            (p?.coordinate || []).forEach((c) => {
                if (c?.type === "marker") {
                    const latlng = toLatLng(c.coordinates);
                    if (latlng) out.push({ kind: "marker", latlng, property: p });
                } else if (c?.type === "polygon") {
                    // Normalize coordinates from GeoJSON or simple array
                    let rings = c?.coordinates?.geometry?.coordinates?.[0];
                    if (!Array.isArray(rings) || rings.every(p => !Array.isArray(p))) {
                        rings = c?.coordinates; // Fallback to assumed simple array
                    }
                    if (Array.isArray(rings)) {
                        const latlngs = rings
                            .map((pair) => toLatLng(pair))
                            .filter(Boolean);
                        if (latlngs.length >= 3) out.push({ kind: "polygon", latlngs, property: p });
                    }
                }
            });
        });
        return out;
    }, [properties]);

    const allBounds = useMemo(() => {
        const pts = [];
        items.forEach((it) => {
            if (it.kind === "marker") pts.push(it.latlng);
            if (it.kind === "polygon") pts.push(...it.latlngs);
        });
        return pts;
    }, [items]);

    return { items, allBounds };
};


// --- 5. MAIN COMPONENT ---
const MapView = ({ properties = [], onMarkerClick }) => {
    const [status, setStatus] = useState("locating");
    const [currentPos, setCurrentPos] = useState(null);
    const { items, allBounds } = useMapData(properties);

    // Geolocation Effect
    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus("unsupported");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setCurrentPos([coords.latitude, coords.longitude]);
                setStatus("ready");
            },
            () => {
                setStatus("denied");
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
        );
    }, []);

    // Initial center calculation: Me → First Result Center → Fallback
    const initialCenter = useMemo(() => {
        if (currentPos) return currentPos;
        if (allBounds.length) return L.latLngBounds(allBounds).getCenter();
        return FALLBACK_CENTER;
    }, [currentPos, allBounds]);

    // UI Banners
    const Banner = ({ children, className = "" }) => (
        <div className={`absolute z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow p-3 text-sm ${className}`}>
            {children}
        </div>
    );

    // Custom controls container for better styling and positioning
    const ControlsContainer = ({ children }) => (
        <div className="leaflet-top leaflet-left !top-3 !left-3 z-[1000] flex flex-col gap-2">
            {children}
        </div>
    );

    return (
        <div className="relative w-full">
            <MapContainer
                center={initialCenter}
                zoom={14}
                scrollWheelZoom
                zoomControl={false} // Disable default control
                style={{ height: "36vh", width: "100%", minHeight: "300px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <L.Control position="topright">
                    <Link
                        href="/maps"
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-amber-700 transition font-medium text-sm"
                    >
                        View All on Map
                    </Link>
                </L.Control>

                {/* Custom Controls */}
                <L.Control position="topleft">
                    <ControlsContainer>
                        <FitResultsButton bounds={allBounds} />
                        <RecenterButton center={currentPos} />
                    </ControlsContainer>
                </L.Control>


                {/* My location (if available) */}
                {currentPos && (
                    <Marker position={currentPos} icon={createCustomIcon("/icon/map-pin-me.png")}>
                        <Popup>You are here 📍</Popup>
                    </Marker>
                )}

                {/* Render Markers and Polygons */}
                {items.map((it, idx) => {
                    const p = it.property || {};

                    if (it.kind === "marker") {
                        const price = formatPriceShort(p?.price);
                        const img = p?.image_url ? `/storage/${p.image_url}` : "/images/placeholder.jpg";
                        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${it.latlng[0]},${it.latlng[1]}`;

                        return (
                            <Marker
                                key={`m-${p?.id}-${idx}`}
                                position={it.latlng}
                                icon={getIconByType(p?.property_type)}
                                eventHandlers={{
                                    click: () => onMarkerClick?.(p),
                                }}
                            >
                                <Popup autoPan>
                                    <div className="max-w-[230px] text-sm leading-relaxed p-0">
                                        <img
                                            src={img}
                                            alt={p?.title || "Property"}
                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                            className="w-full h-[110px] object-cover rounded-t-lg mb-2 border-b border-gray-100"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="p-2 pt-0">
                                            <h3 className="font-semibold mb-1 line-clamp-2">{p?.title || "Untitled Property"}</h3>
                                            <p className="text-amber-600 font-bold text-lg">{price}</p>
                                            {p?.address && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 flex items-start gap-1"><MapPin className="w-3 h-3 shrink-0 mt-0.5" /> {p.address}</p>}
                                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                                                <Link
                                                    href={`/properties/${p?.id}`}
                                                    className="inline-block bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-700 transition flex-1 text-center"
                                                >
                                                    View Details
                                                </Link>
                                                <a
                                                    href={gmaps}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                                                    title="Open directions"
                                                >
                                                    Directions
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }

                    if (it.kind === "polygon") {
                        const col = colorByType(p?.property_type);
                        return (
                            <Polygon
                                key={`g-${p?.id}-${idx}`}
                                positions={it.latlngs}
                                pathOptions={{ color: col, fillColor: col, fillOpacity: 0.25 }}
                            >
                                <Popup>
                                    <div className="text-sm p-1">
                                        <div className="font-semibold">{p?.title || "Property Area"}</div>
                                        {p?.address && <div className="text-gray-600 text-xs mt-1">{p.address}</div>}
                                        <Link
                                            href={`/properties/${p?.id}`}
                                            className="inline-block mt-3 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-700 transition"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </Popup>
                            </Polygon>
                        );
                    }

                    return null;
                })}
            </MapContainer>

            {/* Overlays / Legend */}
            <Banner className="bottom-3 left-3 !left-[unset] !top-[unset]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-600 border border-amber-800/50" />
                        <span className="text-xs font-medium">House</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600 border border-emerald-800/50" />
                        <span className="text-xs font-medium">Land</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-600 border border-violet-800/50" />
                        <span className="text-xs font-medium">Condo</span>
                    </div>
                    <span className="ml-3 text-xs text-gray-500 font-medium border-l pl-3 border-gray-200">{items.length} properties</span>
                </div>
            </Banner>

            {/* Location status badge - position moved */}
            {status !== "ready" && (
                <div className="absolute left-3 bottom-3 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-1.5 text-xs text-gray-700 hidden sm:block">
                    {status === "locating" && "📍 Locating you…"}
                    {status === "denied" && "⚠️ Location access denied."}
                    {status === "unsupported" && "⚠️ Geolocation not supported."}
                </div>
            )}
        </div>
    );
};

export default MapView;
