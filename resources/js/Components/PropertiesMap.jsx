import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---- Fix default marker icons in bundlers (Vite/Webpack) ----
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// ---- Helpers ----
const toRad = (deg) => deg * (Math.PI / 180);
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Safely extract a [lat, lng] from your property schema.
// Supports { lat, lng } or [lng, lat]
function getMarkerLatLng(property) {
    const marker = property?.coordinate?.find?.((c) => c?.type === "marker");
    if (!marker) return null;

    const coords = marker.coordinates;
    if (!coords) return null;

    // {lat,lng}
    if (typeof coords?.lat !== "undefined" && typeof coords?.lng !== "undefined") {
        const lat = parseFloat(coords.lat);
        const lng = parseFloat(coords.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }

    // [lng, lat]
    if (Array.isArray(coords) && coords.length >= 2) {
        const lat = parseFloat(coords[1]);
        const lng = parseFloat(coords[0]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }

    return null;
}

function php(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
}

function RecenterButton({ center }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => map.setView(center, Math.max(map.getZoom(), 16))}
            className="leaflet-top leaflet-left bg-white/95 backdrop-blur border border-gray-200 rounded-md px-3 py-1.5 m-3 shadow text-sm hover:bg-gray-50"
            title="Recenter to my location"
        >
            Recenter
        </button>
    );
}

function FitResultsButton({ points }) {
    const map = useMap();
    const fit = () => {
        if (!points?.length) return;
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds.pad(0.2), { animate: true });
    };
    return (
        <button
            type="button"
            onClick={fit}
            className="leaflet-top leaflet-left bg-white/95 backdrop-blur border border-gray-200 rounded-md px-3 py-1.5 m-3 mt-12 shadow text-sm hover:bg-gray-50"
            title="Fit to results"
        >
            Fit to results
        </button>
    );
}

const MapView = ({ properties = [], initialRadius = 500 }) => {
    const [status, setStatus] = useState("locating"); // locating | ready | denied | unsupported | error
    const [currentPos, setCurrentPos] = useState(null);
    const [radius, setRadius] = useState(() => {
        const saved = localStorage.getItem("mapview:radius");
        return saved ? Number(saved) : initialRadius;
    });
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const mapRef = useRef(null);

    // Geolocation
    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus("unsupported");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
                setStatus("ready");
            },
            (err) => {
                console.warn("Geolocation error:", err);
                setStatus("denied");
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
        );
    }, []);

    // Persist radius
    useEffect(() => {
        localStorage.setItem("mapview:radius", String(radius));
    }, [radius]);

    // Parse properties to points once
    const points = useMemo(() => {
        return properties
            .map((p) => {
                const latlng = getMarkerLatLng(p);
                if (!latlng) return null;
                return { ...p, _latlng: latlng };
            })
            .filter(Boolean);
    }, [properties]);

    // Filter by query + radius
    const filteredProps = useMemo(() => {
        if (!currentPos) return [];
        const q = query.trim().toLowerCase();
        return points.filter((p) => {
            const [lat, lng] = p._latlng;
            const dist = getDistanceFromLatLonInMeters(currentPos[0], currentPos[1], lat, lng);
            const inRadius = dist <= radius;
            if (!inRadius) return false;

            if (!q) return true;
            const haystack = `${p?.title ?? ""} ${p?.address ?? ""}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [points, currentPos, radius, query]);

    const nearbyLatLngs = useMemo(() => filteredProps.map((p) => p._latlng), [filteredProps]);

    // Handlers
    const onCardClick = useCallback((p) => {
        setSelectedId(p.id);
        const [lat, lng] = p._latlng;
        const map = mapRef.current;
        if (map) {
            map.flyTo([lat, lng], Math.max(map.getZoom(), 17), { duration: 0.7 });
        }
    }, []);

    // UI states
    if (status === "locating") {
        return (
            <div className="relative bg-white rounded-2xl shadow-md overflow-hidden max-w-full">
                <div className="bg-gradient-to-tl from-primary to-accent text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-base md:text-lg font-semibold">
                        <span>Properties Nearby</span>
                        <span className="bg-[#E0B52B] text-primary rounded-full px-3 py-1 text-sm font-bold min-w-[40px] text-center shadow">—</span>
                    </div>
                    <span className="text-sm md:text-base font-medium text-white/90">Locating…</span>
                </div>
                <div className="p-6 text-gray-600 text-sm">📍 Locating you…</div>
            </div>
        );
    }

    if (status === "unsupported" || status === "denied") {
        return (
            <div className="relative bg-white rounded-2xl shadow-md overflow-hidden max-w-full">
                <div className="bg-gradient-to-tl from-primary to-accent text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-base md:text-lg font-semibold">
                        <span>Properties Nearby</span>
                        <span className="bg-[#E0B52B] text-primary rounded-full px-3 py-1 text-sm font-bold min-w-[40px] text-center shadow">—</span>
                    </div>
                    <span className="text-sm md:text-base font-medium text-white/90">Location off</span>
                </div>
                <div className="p-6 text-gray-600 text-sm">
                    ⚠️ {status === "unsupported"
                    ? "Your browser does not support geolocation."
                    : "Location permission denied. Enable location to see nearby properties."}
                </div>
            </div>
        );
    }

    // ---- Main Render ----
    return (
        <div className="relative z-10 bg-white rounded-2xl shadow-md overflow-hidden max-w-full">
            {/* Header / Controls */}
            <div className="bg-gradient-to-tl from-primary to-accent text-white px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3 text-base md:text-lg font-semibold">
                    <span>Properties Nearby</span>
                    <span className="bg-[#E0B52B] text-primary rounded-full px-3 py-1 text-sm font-bold min-w-[40px] text-center shadow">
            {filteredProps.length}
          </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search title or address…"
                            className="pl-3 pr-3 py-2 rounded-md border border-white/30 bg-white/10 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                            aria-label="Search properties"
                        />
                    </div>

                    {/* Radius */}
                    <div className="flex items-center gap-2 text-white/90">
                        <span className="text-xs hidden sm:inline">Radius:</span>
                        <input
                            type="range"
                            min={200}
                            max={2000}
                            step={50}
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            aria-label="Radius in meters"
                        />
                        <span className="text-xs font-semibold tabular-nums">{radius} m</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="relative">
                <MapContainer
                    center={currentPos}
                    zoom={16}
                    style={{ height: 560, width: "100%", zIndex: 10 }}
                    scrollWheelZoom
                    whenCreated={(map) => (mapRef.current = map)}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    {/* Controls (custom buttons) */}
                    <RecenterButton center={currentPos} />
                    <FitResultsButton points={nearbyLatLngs} />

                    {/* User location ring + marker */}
                    <Circle center={currentPos} radius={radius} pathOptions={{ color: "#5C7934", fillOpacity: 0.08 }} />
                    <Marker position={currentPos}>
                        <Popup>
                            <div className="text-sm font-medium">📍 You are here</div>
                        </Popup>
                    </Marker>

                    {/* Nearby properties */}
                    {filteredProps.map((property) => {
                        const [lat, lng] = property._latlng;
                        const isSelected = selectedId === property.id;
                        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                        return (
                            <Marker key={property.id} position={[lat, lng]}>
                                <Popup autoPan={true} autoClose={false} closeOnClick={false} closeButton={true}>
                                    <div className="max-w-[230px] text-sm leading-relaxed">
                                        <img
                                            src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                            onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                            alt={property?.title ?? "Property"}
                                            className="w-full h-[110px] object-cover rounded mb-2 border border-gray-200"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <h3 className="font-semibold mb-1 line-clamp-2">{property?.title ?? "Untitled Property"}</h3>
                                        <p className="text-green-700 font-bold">{php(property?.price)}</p>
                                        {property?.address && (
                                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{property.address}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <a
                                                href={`/property/${property.id}`}
                                                className="inline-block bg-primary text-white px-3 py-1 rounded text-xs font-medium hover:bg-accent transition"
                                            >
                                                View Details
                                            </a>
                                            <a
                                                href={gmaps}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-50 transition"
                                                title="Open directions in Google Maps"
                                            >
                                                Directions
                                            </a>
                                        </div>
                                        {isSelected && <div className="mt-2 text-[11px] text-primary">Selected</div>}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Empty state overlay when no results in radius */}
                {filteredProps.length === 0 && (
                    <div className="absolute inset-x-4 bottom-4 md:left-1/2 md:right-auto md:bottom-auto md:top-4 md:-translate-x-1/2 z-[1000]">
                        <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-4 py-3 text-sm text-gray-700">
                            No properties within {radius} m. Try increasing the radius or clearing search.
                        </div>
                    </div>
                )}
            </div>

            {/* List of results (click to focus) */}
            <div className="p-4 md:p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProps.map((p) => {
                        const [lat, lng] = p._latlng;
                        return (
                            <button
                                key={`card-${p.id}`}
                                type="button"
                                onClick={() => onCardClick(p)}
                                className="text-left bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition shadow-xs"
                                title="Focus on map"
                            >
                                <div className="flex gap-3">
                                    <img
                                        src={p?.image_url ? `/storage/${p.image_url}` : "/placeholder.png"}
                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                        alt={p?.title ?? "Property"}
                                        className="w-20 h-20 object-cover rounded border border-gray-200"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 line-clamp-1">{p?.title ?? "Untitled Property"}</p>
                                        <p className="text-green-700 text-sm font-semibold">{php(p?.price)}</p>
                                        {p?.address && <p className="text-xs text-gray-500 line-clamp-1">{p.address}</p>}
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {lat.toFixed(5)}, {lng.toFixed(5)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MapView;
