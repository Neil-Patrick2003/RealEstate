import React, { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Tooltip,
    Polygon,
    ZoomControl,
    useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { Link } from "@inertiajs/react";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// FRONTEND Geoapify key (for Routing: time + distance)
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

/* ---------------- Property Icons ---------------- */
const houseIcon = new L.Icon({
    iconUrl: "/icon/house.png",
    iconSize: [60, 90],
    iconAnchor: [30, 65],
    popupAnchor: [0, -70],
    shadowUrl: iconShadow,
    shadowSize: [50, 50]
});

const landIcon = new L.Icon({
    iconUrl: "/icon/land.png",
    iconSize: [60, 90],
    iconAnchor: [30, 65],
    popupAnchor: [0, -30],
    shadowUrl: iconShadow,
    shadowSize: [40, 40]
});

/* ---------------- Helpers ---------------- */
const DEFAULT_CENTER = [13.41, 122.56];

const toLatLng = (coord) => {
    if (!coord) return null;
    // {lat, lng}
    if (
        typeof coord?.lat !== "undefined" &&
        typeof coord?.lng !== "undefined"
    ) {
        const lat = parseFloat(coord.lat);
        const lng = parseFloat(coord.lng);
        return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
    // [lng, lat]
    if (Array.isArray(coord) && coord.length >= 2) {
        const lng = parseFloat(coord[0]);
        const lat = parseFloat(coord[1]);
        return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
    return null;
};

const getIconByType = (type) => {
    const t = (type || "").toLowerCase();
    switch (t) {
        case "land":
            return landIcon;
        default:
            return houseIcon;
    }
};

const colorByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return "#28a745";
        case "condo":
            return "#c084fc";
        case "commercial":
            return "#f59e0b";
        default:
            return "#007bff";
    }
};

const php = (n) =>
    Number(n ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    });

const formatPrice = (price) => {
    if (!price) return "Price N/A";

    const numPrice = Number(price);
    if (numPrice >= 1_000_000) {
        const millions = numPrice / 1_000_000;
        return `₱${
            millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)
        }M`;
    } else if (numPrice >= 1000) {
        const thousands = numPrice / 1000;
        if (thousands >= 100) {
            return `₱${thousands.toFixed(0)}k`;
        } else {
            return `₱${
                thousands % 1 === 0
                    ? thousands.toFixed(0)
                    : thousands.toFixed(1)
            }k`;
        }
    } else {
        return `₱${numPrice.toLocaleString()}`;
    }
};

/* ---------- Geoapify categories → label & icon ---------- */

// Turn Geoapify categories into a nice label
// e.g. "education.school"           -> "School"
//      "commercial.food_and_drink"  -> "Food and drink"
//      "healthcare.hospital"        -> "Hospital"
const poiCategoryToLabel = (categories = []) => {
    if (!categories.length) return null;

    const main = categories[0];
    const parts = main.split(".");

    let label = parts[parts.length - 1];

    if (label === "food_and_drink") label = "food and drink";
    if (label === "shopping_mall") label = "shopping mall";

    label = label.replace(/_/g, " "); // "food_and_drink" -> "food and drink"

    return label.charAt(0).toUpperCase() + label.slice(1);
};

// Geoapify categories → emoji + color sticker
// Uses MAIN GROUP (education, healthcare, catering, commercial, sport, leisure, tourism, public_transport, etc.)
const getPoiIcon = (categories = []) => {
    const main = categories[0] || "";       // e.g. "education.school"
    const parts = main.split(".");
    const group = parts[0];                 // "education"
    const sub   = parts[1] || "";           // "school", "hospital", "shopping_mall", etc.

    let emoji = "📍";
    let bg = "#ffffff";
    let border = "#4b5563";

    // Education: schools, colleges, universities
    if (group === "education") {
        emoji = "🏫";
        bg = "#dbeafe";     // blue-100
        border = "#1d4ed8"; // blue-700
    }
    // Healthcare: hospitals, clinics, dentists, pharmacy
    else if (group === "healthcare") {
        emoji = "🏥";
        bg = "#fee2e2";     // red-100
        border = "#b91c1c"; // red-700
    }
    // Catering & food-related: cafe, restaurant, fast_food
    else if (
        group === "catering" ||
        main.startsWith("commercial.food_and_drink")
    ) {
        emoji = "☕";
        bg = "#ede9fe";     // violet-100
        border = "#6d28d9"; // violet-700
    }
    // Shopping: malls, supermarkets, marketplaces, generic commercial
    else if (
        group === "commercial" &&
        (sub === "shopping_mall" ||
            sub === "supermarket" ||
            sub === "marketplace")
    ) {
        emoji = "🏢";
        bg = "#fef3c7";     // amber-100
        border = "#b45309"; // amber-700
    }
    else if (group === "commercial") {
        emoji = "🛒";
        bg = "#fef3c7";     // amber-100
        border = "#b45309"; // amber-700
    }
    // Sport / leisure / parks
    else if (group === "sport" || group === "leisure") {
        emoji = "⚽";
        bg = "#dcfce7";     // green-100
        border = "#15803d"; // green-700
    }
    // Tourism / attractions / sights
    else if (group === "tourism") {
        emoji = "📸";
        bg = "#e0f2fe";     // sky-100
        border = "#0369a1"; // sky-700
    }
    // Public transport, railway, bus
    else if (group === "public_transport" || group === "railway") {
        emoji = "🚉";
        bg = "#e0f2fe";     // sky-100
        border = "#0369a1"; // sky-700
    }
    // Offices & government / administrative
    else if (
        group === "office" ||
        group === "government" ||
        group === "administrative"
    ) {
        emoji = "🏛️";
        bg = "#f5f5f4";     // stone-100
        border = "#44403c"; // stone-700
    }
    // Religion / places of worship
    else if (group === "religion") {
        emoji = "⛪";
        bg = "#fee2e2";     // red-100
        border = "#b91c1c"; // red-700
    }
    // Natural features: forest, mountain, water, national parks
    else if (group === "natural" || group === "national_park") {
        emoji = "🌳";
        bg = "#bbf7d0";     // green-100
        border = "#15803d"; // green-700
    }
    // Pets
    else if (group === "pet") {
        emoji = "🐾";
        bg = "#fef9c3";     // yellow-100
        border = "#ca8a04"; // yellow-600
    }

    return L.divIcon({
        html: `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 999px;
                background: ${bg};
                border: 2px solid ${border};
                box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                font-size: 16px;
            ">
                <span>${emoji}</span>
            </div>
        `,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28], // bottom center
        popupAnchor: [0, -28]
    });
};

/* ---------------- Geocoder Control ---------------- */
function GeocoderControl() {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        const geocoder = L.Control.Geocoder.nominatim();
        const control = L.Control.geocoder({
            query: "",
            placeholder: "Search location...",
            defaultMarkGeocode: true,
            geocoder,
            position: "topright"
        }).addTo(map);

        control.on("markgeocode", (e) => {
            const bounds = L.latLngBounds(e.geocode.bbox);
            map.fitBounds(bounds);
        });

        return () => map.removeControl(control);
    }, [map]);
    return null;
}

/* ---------------- Fit & Recenter ---------------- */
function FitResultsButton({ bounds }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() =>
                bounds?.isValid() && map.fitBounds(bounds, { padding: [50, 50] })
            }
            className="leaflet-top leaflet-left m-3 px-3 py-2 rounded-md bg-white/95 backdrop-blur border border-gray-200 shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 z-[1000]"
            title="Fit to results"
        >
            <span>📍</span>
            Fit to Results
        </button>
    );
}

function RecenterButton() {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() =>
                map.setView(DEFAULT_CENTER, Math.max(map.getZoom(), 6))
            }
            className="leaflet-top leaflet-left m-3 mt-[70px] px-3 py-2 rounded-md bg-white/95 backdrop-blur border border-gray-200 shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 z-[1000]"
            title="Recenter to default"
        >
            <span>🎯</span>
            Recenter
        </button>
    );
}

/* ---------------- Tile Layers ---------------- */
const tileLayers = {
    street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
            '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    },
    dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
};

/* ---------------- Main Component ---------------- */
export default function MapView({ property_listing = [], onMarkerClick }) {
    const [selected, setSelected] = useState(null);

    // DEFAULT TO SATELLITE VIEW
    const [currentView] = useState("satellite");

    const [typeFilter, setTypeFilter] = useState(() => new Set());
    const [showFilters, setShowFilters] = useState(true);

    // Nearby POIs state (for selected property)
    const [poiPlaces, setPoiPlaces] = useState([]);
    const [loadingPoi, setLoadingPoi] = useState(false);
    const [activeListingForPoi, setActiveListingForPoi] = useState(null);

    // Unique property types
    const types = useMemo(() => {
        const set = new Set();
        (property_listing || []).forEach((l) => {
            const t = (l?.property?.property_type || "").trim();
            if (t) set.add(t);
        });
        return Array.from(set).sort();
    }, [property_listing]);

    const filteredListings = useMemo(() => {
        if (!typeFilter.size) return property_listing;
        return (property_listing || []).filter((l) =>
            typeFilter.has(l?.property?.property_type)
        );
    }, [property_listing, typeFilter]);

    // Precompute shapes + bounds
    const items = useMemo(() => {
        const out = [];
        (filteredListings || []).forEach((listing) => {
            const prop = listing?.property;
            const coords = prop?.coordinate || [];
            coords.forEach((c) => {
                if (c?.type === "marker") {
                    const latlng = toLatLng(c.coordinates);
                    if (latlng)
                        out.push({ kind: "marker", latlng, listing });
                } else if (c?.type === "polygon") {
                    let ring =
                        c?.coordinates?.geometry?.coordinates?.[0];
                    if (!Array.isArray(ring)) ring = c?.coordinates;
                    const latlngs = Array.isArray(ring)
                        ? ring.map(toLatLng).filter(Boolean)
                        : [];
                    if (latlngs.length >= 3)
                        out.push({ kind: "polygon", latlngs, listing });
                }
            });
        });
        return out;
    }, [filteredListings]);

    const bounds = useMemo(() => {
        const b = L.latLngBounds([]);
        items.forEach((it) => {
            if (it.kind === "marker") b.extend(it.latlng);
            if (it.kind === "polygon")
                it.latlngs.forEach((pt) => b.extend(pt));
        });
        // Include POIs in bounds as well
        poiPlaces.forEach((poi) => {
            const geom = poi.geometry;
            if (geom && Array.isArray(geom.coordinates)) {
                const [lon, lat] = geom.coordinates;
                b.extend([lat, lon]);
            }
        });
        return b;
    }, [items, poiPlaces]);

    // Counts by type for legend
    const counts = useMemo(() => {
        const agg = {};
        filteredListings.forEach((l) => {
            const t = (l?.property?.property_type || "other").toLowerCase();
            agg[t] = (agg[t] || 0) + 1;
        });
        return agg;
    }, [filteredListings]);

    async function loadPoiForListing(listing) {
        try {
            setLoadingPoi(true);
            setActiveListingForPoi(listing);

            const prop = listing?.property;
            if (!prop?.id) {
                setPoiPlaces([]);
                return;
            }

            const marker = (prop.coordinate || []).find(
                (c) => c?.type === "marker"
            );
            const latlng = toLatLng(marker?.coordinates);
            if (!latlng) {
                setPoiPlaces([]);
                return;
            }
            const [propLat, propLng] = latlng;

            // 1) Get nearby places from backend (all categories defined there)
            const res = await fetch(`/properties/${prop.id}/nearby-places`);
            if (!res.ok) {
                console.error("Failed to load nearby places", await res.text());
                setPoiPlaces([]);
                return;
            }
            const data = await res.json();
            const features = (data.features || []).filter(
                (f) => f.geometry && f.geometry.type === "Point"
            );

            // sort by straight distance, limit to 15
            const sorted = features.sort((a, b) => {
                const da = a.properties?.distance ?? 0;
                const db = b.properties?.distance ?? 0;
                return da - db;
            });
            const limited = sorted.slice(0, 15);

            // If no frontend key, just use straight-line distance
            if (!GEOAPIFY_KEY) {
                setPoiPlaces(limited);
                return;
            }

            // 2) Enrich with routing time + distance (drive)
            const enriched = await Promise.all(
                limited.map(async (place) => {
                    try {
                        const [poiLon, poiLat] = place.geometry.coordinates;
                        const url = `https://api.geoapify.com/v1/routing?waypoints=${propLat},${propLng}|${poiLat},${poiLon}&mode=drive&format=json&apiKey=${GEOAPIFY_KEY}`;

                        const r = await fetch(url);
                        if (!r.ok) {
                            console.error("Routing failed", await r.text());
                            return {
                                ...place,
                                travelTimeMinutes: null,
                                travelDistanceKm: null
                            };
                        }

                        const routeData = await r.json();
                        const result =
                            routeData.results && routeData.results.length > 0
                                ? routeData.results[0]
                                : null;

                        const seconds = result?.time;
                        const meters = result?.distance;

                        const minutes =
                            typeof seconds === "number"
                                ? Math.round(seconds / 60)
                                : null;
                        const km =
                            typeof meters === "number"
                                ? Number((meters / 1000).toFixed(1))
                                : null;

                        return {
                            ...place,
                            travelTimeMinutes: minutes,
                            travelDistanceKm: km
                        };
                    } catch (err) {
                        console.error("Routing error", err);
                        return {
                            ...place,
                            travelTimeMinutes: null,
                            travelDistanceKm: null
                        };
                    }
                })
            );

            setPoiPlaces(enriched);
        } catch (e) {
            console.error("Error loading POIs", e);
            setPoiPlaces([]);
        } finally {
            setLoadingPoi(false);
        }
    }

    const handleMarkerClick = (listing) => {
        if (onMarkerClick) onMarkerClick(listing);
        else setSelected(listing);
        loadPoiForListing(listing);
    };

    const toggleType = (t) => {
        setSelected(null);
        setTypeFilter((prev) => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t);
            else next.add(t);
            return next;
        });
    };

    const clearAllFilters = () => {
        setTypeFilter(new Set());
        setSelected(null);
        setPoiPlaces([]);
        setActiveListingForPoi(null);
    };

    return (
        <div className="relative">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={6}
                scrollWheelZoom
                style={{ height: "93vh", width: "100%" }}
                zoomControl={false}
            >
                {/* Base Tile Layer (satellite by default) */}
                <TileLayer {...tileLayers[currentView]} />

                <ZoomControl position="topright" />
                <GeocoderControl />
                <FitResultsButton bounds={bounds} />
                <RecenterButton />

                {/* Property markers & polygons */}
                {items.map((it, idx) => {
                    const prop = it.listing?.property;

                    if (it.kind === "marker") {
                        const icon = getIconByType(
                            prop?.property_type
                        );
                        const price = formatPrice(prop?.price);

                        return (
                            <Marker
                                key={`m-${prop?.id}-${idx}`}
                                position={it.latlng}
                                icon={icon}
                                eventHandlers={{
                                    click: () =>
                                        handleMarkerClick(it.listing)
                                }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -50]}
                                    opacity={1}
                                    className="custom-tooltip"
                                >
                                    <div className="text-xs min-w-[200px]">
                                        <div className="font-semibold text-gray-800 mb-1">
                                            {prop?.title ||
                                                "Property"}
                                        </div>
                                        <div className="text-primary font-bold mb-1">
                                            {price}
                                        </div>
                                        <div className="text-gray-600 text-xs">
                                            {prop?.address ||
                                                "Location not specified"}
                                        </div>
                                        <div className="mt-1">
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${
                                                    prop?.property_type ===
                                                    "land"
                                                        ? "bg-green-100 text-green-800"
                                                        : prop?.property_type ===
                                                        "condo"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : prop?.property_type ===
                                                            "commercial"
                                                                ? "bg-amber-100 text-amber-800"
                                                                : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {prop?.property_type ||
                                                    "Property"}
                                            </span>
                                        </div>
                                    </div>
                                </Tooltip>
                            </Marker>
                        );
                    }

                    if (it.kind === "polygon") {
                        const col = colorByType(
                            it.listing?.property?.property_type
                        );
                        const p = it.listing?.property;

                        return (
                            <Polygon
                                key={`g-${p?.id}-${idx}`}
                                positions={it.latlngs}
                                pathOptions={{
                                    color: col,
                                    fillColor: col,
                                    fillOpacity: 0.35,
                                    weight: 2
                                }}
                            >
                                <Tooltip
                                    sticky
                                    direction="top"
                                    opacity={1}
                                    className="custom-tooltip"
                                >
                                    <div className="text-xs min-w-[200px]">
                                        <div className="font-semibold text-gray-800 mb-1">
                                            {p?.title ||
                                                "Property Area"}
                                        </div>
                                        <div className="text-primary font-bold mb-1">
                                            {formatPrice(p?.price)}
                                        </div>
                                        {p?.address && (
                                            <div className="text-gray-600 text-xs">
                                                {p.address}
                                            </div>
                                        )}
                                    </div>
                                </Tooltip>
                            </Polygon>
                        );
                    }

                    return null;
                })}

                {/* Nearby places markers (for selected property) */}
                {poiPlaces.map((poi, idx) => {
                    const geom = poi.geometry;
                    if (!geom || !Array.isArray(geom.coordinates)) return null;
                    const [lon, lat] = geom.coordinates;
                    const latlng = [lat, lon];
                    const p = poi.properties || {};
                    const icon = getPoiIcon(p.categories || []);
                    const label = poiCategoryToLabel(p.categories || []);

                    const straightMeters = p.distance;
                    const straightKm =
                        typeof straightMeters === "number"
                            ? Number((straightMeters / 1000).toFixed(1))
                            : null;

                    const timeText =
                        typeof poi.travelTimeMinutes === "number"
                            ? `${poi.travelTimeMinutes} mins drive`
                            : null;
                    const routeKmText =
                        typeof poi.travelDistanceKm === "number"
                            ? `${poi.travelDistanceKm} km`
                            : null;

                    let line2 = "";
                    if (timeText) {
                        line2 = routeKmText
                            ? `${timeText} • ${routeKmText}`
                            : timeText;
                    } else if (straightKm != null) {
                        line2 = `${straightKm} km away`;
                    }

                    return (
                        <Marker
                            key={`poi-${p.place_id || idx}`}
                            position={latlng}
                            icon={icon}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -10]}
                                opacity={1}
                                className="custom-tooltip"
                            >
                                <div className="text-xs min-w-[180px]">
                                    <div className="font-semibold text-gray-800 mb-1">
                                        {p.name || "Place"}
                                    </div>
                                    {label && (
                                        <div className="text-[11px] text-emerald-700 mb-1">
                                            {label}
                                        </div>
                                    )}
                                    {p.address_line1 && (
                                        <div className="text-gray-600 text-[11px] mb-1">
                                            {p.address_line1}
                                        </div>
                                    )}
                                    {line2 && (
                                        <div className="text-[11px] text-gray-500">
                                            {line2}
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Legend + Filters */}
            {showFilters && (
                <div className="absolute left-3 top-3 z-[1000] space-y-2">
                    {/* Results Counter */}
                    <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Properties Found
                            </h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                            {filteredListings.length}
                        </div>
                        <div className="text-xs text-gray-500">
                            of {property_listing.length} total
                        </div>
                        {activeListingForPoi && (
                            <div className="mt-2 text-[11px] text-gray-600">
                                Nearby places for:{" "}
                                <span className="font-semibold">
                                    {activeListingForPoi?.property?.title ||
                                        "Selected property"}
                                </span>
                                {loadingPoi && " • loading…"}
                            </div>
                        )}
                    </div>

                    {/* Type Filters */}
                    {types.length > 0 && (
                        <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg px-4 py-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Filter by Type
                                </h3>
                                {typeFilter.size > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-primary hover:text-primary-dark font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {types.map((t) => {
                                    const active = typeFilter.has(t);
                                    const count =
                                        counts[t.toLowerCase()] || 0;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() =>
                                                toggleType(t)
                                            }
                                            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                                                active
                                                    ? "bg-primary text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: active
                                                            ? "white"
                                                            : colorByType(
                                                                t
                                                            )
                                                    }}
                                                />
                                                {t}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    active
                                                        ? "bg-white/20 text-white"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Legend */}
                    <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">
                            Legend
                        </h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>House/Villa</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Land</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span>Condo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span>Commercial</span>
                            </div>
                            <div className="mt-2 space-y-1 text-[11px]">
                                <div className="flex items-center gap-2">
                                    <span>🏫</span>
                                    <span>Education (schools, universities)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🏥</span>
                                    <span>Healthcare (hospitals, clinics)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>☕</span>
                                    <span>Catering / food & drink</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🏢 / 🛒</span>
                                    <span>Commercial / shopping</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>⚽</span>
                                    <span>Sport / leisure / parks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📸</span>
                                    <span>Tourism / sights</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🚉</span>
                                    <span>Transport / railway</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🏛️</span>
                                    <span>Offices / government</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>⛪</span>
                                    <span>Places of worship</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🌳</span>
                                    <span>Natural / national park</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🐾</span>
                                    <span>Pet-related</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>Other categories</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show Filters Button (when hidden) */}
            {!showFilters && (
                <button
                    onClick={() => setShowFilters(true)}
                    className="absolute left-3 top-3 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg px-4 py-3 hover:bg-white transition-colors"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <span>📊</span>
                        Show Filters
                    </div>
                </button>
            )}

            {/* Fallback bottom card */}
            {!onMarkerClick && selected && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-[1100] w-[92vw] sm:w-[520px]">
                    <div className="bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 overflow-hidden transform transition-all duration-300">
                        <div className="flex gap-4 p-4">
                            <img
                                src={
                                    selected?.property?.image_url
                                        ? `/storage/${selected.property.image_url}`
                                        : "/images/placeholder.jpg"
                                }
                                onError={(e) =>
                                    (e.currentTarget.src =
                                        "/images/placeholder.jpg")
                                }
                                alt={
                                    selected?.property?.title ||
                                    "Property"
                                }
                                className="w-20 h-20 rounded-lg object-cover ring-1 ring-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                                    {selected?.property?.title ||
                                        "Property"}
                                </div>
                                <div className="text-xs text-gray-600 mb-2 line-clamp-1">
                                    {selected?.property?.address || "—"}
                                </div>
                                <div className="text-primary font-bold text-lg mb-3">
                                    {formatPrice(
                                        selected?.property?.price
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/maps/property/${selected?.property?.id}`}
                                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                                    >
                                        View Details
                                    </Link>
                                    {(() => {
                                        const m = (
                                            selected?.property
                                                ?.coordinate || []
                                        ).find(
                                            (c) =>
                                                c?.type === "marker"
                                        );
                                        const ll = toLatLng(
                                            m?.coordinates
                                        );
                                        const href = ll
                                            ? `https://www.google.com/maps/dir/?api=1&destination=${ll[0]},${ll[1]}`
                                            : null;
                                        return href ? (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Get Directions
                                            </a>
                                        ) : null;
                                    })()}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setPoiPlaces([]);
                                    setActiveListingForPoi(null);
                                }}
                                className="self-start h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
