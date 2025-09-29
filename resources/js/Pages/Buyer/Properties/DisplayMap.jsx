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

// --- Fix default Leaflet marker icons (incl. retina) ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// --- Custom Icons (house / land) ---
const houseIcon = new L.Icon({
    iconUrl: "/icon/house.png",
    iconSize: [85, 120],
    iconAnchor: [50, 77],
    popupAnchor: [1, -40],
    shadowUrl: markerShadow,
    shadowSize: [50, 50],
});

const landIcon = new L.Icon({
    iconUrl: "/icon/land.png",
    iconSize: [85, 120],
    iconAnchor: [50, 77],
    popupAnchor: [1, -40],
    shadowUrl: markerShadow,
    shadowSize: [50, 50],
});

const getIconByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return landIcon;
        default:
            return houseIcon;
    }
};

// -------- Helpers --------
const toLatLng = (coord) => {
    // Supports {lat,lng} or [lng,lat]
    if (!coord) return null;
    if (typeof coord?.lat !== "undefined" && typeof coord?.lng !== "undefined") {
        const lat = parseFloat(coord.lat);
        const lng = parseFloat(coord.lng);
        return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
    if (Array.isArray(coord) && coord.length >= 2) {
        const lng = parseFloat(coord[0]);
        const lat = parseFloat(coord[1]);
        return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
    return null;
};

const colorByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return "#A8D5BA";
        case "house":
            return "#FFD59E";
        case "condo":
            return "#CDB4DB";
        default:
            return "#AEDFF7";
    }
};

// Fit-to-bounds control
function FitResultsButton({ bounds }) {
    const map = useMap();
    const fit = () => {
        if (!bounds?.length) return;
        map.fitBounds(L.latLngBounds(bounds).pad(0.2), { animate: true });
    };
    return (
        <button
            type="button"
            onClick={fit}
            className="leaflet-top leaflet-left bg-white/95 backdrop-blur border border-gray-200 rounded-md px-3 py-1.5 m-3 shadow text-sm hover:bg-gray-50"
            title="Fit to results"
        >
            Fit to results
        </button>
    );
}

// Recenter-to-me control
function RecenterButton({ center }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => center && map.setView(center, Math.max(map.getZoom(), 15))}
            className="leaflet-top leaflet-left bg-white/95 backdrop-blur border border-gray-200 rounded-md px-3 py-1.5 m-3 mt-[52px] shadow text-sm hover:bg-gray-50"
            title="Recenter to my location"
        >
            Recenter
        </button>
    );
}

// -------- Main component --------
const MapView = ({ properties = [], onMarkerClick }) => {
    const [status, setStatus] = useState("locating"); // locating | ready | denied | unsupported
    const [currentPos, setCurrentPos] = useState(null);
    const mapRef = useRef(null);

    // Manila fallback center (adjust if you have a project default)
    const FALLBACK_CENTER = [14.5995, 120.9842];

    // Robustly extract all map shapes + bounds
    const items = useMemo(() => {
        const out = [];
        (properties || []).forEach((p) => {
            (p?.coordinate || []).forEach((c) => {
                if (c?.type === "marker") {
                    const latlng = toLatLng(c.coordinates);
                    if (latlng) out.push({ kind: "marker", latlng, property: p });
                } else if (c?.type === "polygon") {
                    // Support GeoJSON: { geometry: { coordinates: [ [ [lng,lat], ... ] ] } }
                    let rings = c?.coordinates?.geometry?.coordinates?.[0];
                    // Or direct array of [lng,lat] pairs
                    if (!Array.isArray(rings)) rings = c?.coordinates;
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

    // Geolocation
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
                // Permission denied or error — still render with fallback
                setStatus("denied");
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
        );
    }, []);

    // Initial center: me → first result → fallback
    const initialCenter =
        currentPos ||
        (allBounds.length ? L.latLngBounds(allBounds).getCenter() : null) ||
        FALLBACK_CENTER;

    // UI banners
    const Banner = ({ children }) => (
        <div className="absolute left-3 top-3 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-2 text-sm text-gray-700">
            {children}
        </div>
    );

    return (
        <div className="relative w-full">
            <MapContainer
                center={initialCenter}
                zoom={14}
                scrollWheelZoom
                zoomControl
                style={{ height: "36vh", width: "100%" }}
                whenCreated={(m) => (mapRef.current = m)}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Controls */}
                <FitResultsButton bounds={allBounds} />
                <RecenterButton center={currentPos} />

                {/* My location (if available) */}
                {currentPos && (
                    <Marker position={currentPos}>
                        <Popup>You are here 📍</Popup>
                    </Marker>
                )}

                {/* Render shapes */}
                {items.map((it, idx) => {
                    if (it.kind === "marker") {
                        const ic = getIconByType(it.property?.property_type);
                        const p = it.property || {};
                        const price =
                            p?.price != null
                                ? Number(p.price).toLocaleString("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                    maximumFractionDigits: 0,
                                })
                                : "Price N/A";
                        const img = p?.image_url ? `/storage/${p.image_url}` : "/images/placeholder.jpg";
                        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${it.latlng[0]},${it.latlng[1]}`;

                        return (
                            <Marker
                                key={`m-${p?.id}-${idx}`}
                                position={it.latlng}
                                icon={ic}
                                eventHandlers={{
                                    click: () => onMarkerClick?.(p),
                                }}
                            >
                                <Popup autoPan>
                                    <div className="max-w-[230px] text-sm leading-relaxed">
                                        <img
                                            src={img}
                                            alt={p?.title || "Property"}
                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                            className="w-full h-[110px] object-cover rounded mb-2 border border-gray-200"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <h3 className="font-semibold mb-1 line-clamp-2">{p?.title || "Untitled Property"}</h3>
                                        <p className="text-green-700 font-bold">{price}</p>
                                        {p?.address && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{p.address}</p>}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Link
                                                href={`/properties/${p?.id}`}
                                                className="inline-block bg-primary text-white px-3 py-1 rounded text-xs font-medium hover:bg-accent transition"
                                            >
                                                View Details
                                            </Link>
                                            <a
                                                href={gmaps}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-50 transition"
                                                title="Open directions"
                                            >
                                                Directions
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }

                    if (it.kind === "polygon") {
                        const p = it.property || {};
                        const col = colorByType(p?.property_type);
                        return (
                            <Polygon
                                key={`g-${p?.id}-${idx}`}
                                positions={it.latlngs}
                                pathOptions={{ color: col, fillColor: col, fillOpacity: 0.25 }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <div className="font-semibold">{p?.title || "Property Area"}</div>
                                        {p?.address && <div className="text-gray-600 text-xs mt-1">{p.address}</div>}
                                        <Link
                                            href={`/properties/${p?.id}`}
                                            className="inline-block mt-2 bg-primary text-white px-3 py-1 rounded text-xs font-medium hover:bg-accent transition"
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

            {/* Overlays */}
            <div className="absolute right-3 top-3 z-[1000]">
                <Link
                    href="/maps"
                    className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-accent transition"
                >
                    View All on Map
                </Link>
            </div>

            <Banner>
                <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#FFD59E" }} />
                    <span className="text-xs">House</span>
                    <span className="inline-block h-2 w-2 rounded-full ml-3" style={{ background: "#A8D5BA" }} />
                    <span className="text-xs">Land</span>
                    <span className="inline-block h-2 w-2 rounded-full ml-3" style={{ background: "#CDB4DB" }} />
                    <span className="text-xs">Condo</span>
                    <span className="ml-3 text-xs text-gray-500">• {items.length} shapes</span>
                </div>
            </Banner>

            {/* Location status badge */}
            {status !== "ready" && (
                <div className="absolute left-3 bottom-3 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-1.5 text-xs text-gray-700">
                    {status === "locating" && "📍 Locating you…"}
                    {status === "denied" && "⚠️ Location permission denied"}
                    {status === "unsupported" && "⚠️ Geolocation not supported"}
                </div>
            )}
        </div>
    );
};

export default MapView;
