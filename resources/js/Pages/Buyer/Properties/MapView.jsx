import React, { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Tooltip,
    Polygon,
    ZoomControl,
    useMap,
    LayersControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { Link } from "@inertiajs/react";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ---------------- Icons ---------------- */
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
    if (typeof coord?.lat !== "undefined" && typeof coord?.lng !== "undefined") {
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
        case "land": return landIcon;
        default: return houseIcon;
    }
};

const colorByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land": return "#28a745";
        case "condo": return "#c084fc";
        case "commercial": return "#f59e0b";
        default: return "#007bff";
    }
};

const php = (n) =>
    Number(n ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    });

const formatPrice = (price) => {
    if (!price) return 'Price N/A';

    const numPrice = Number(price);
    if (numPrice >= 1000000) {
        const millions = numPrice / 1000000;
        return `₱${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
    } else if (numPrice >= 1000) {
        const thousands = numPrice / 1000;
        if (thousands >= 100) {
            return `₱${thousands.toFixed(0)}k`;
        } else {
            return `₱${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
        }
    } else {
        return `₱${numPrice.toLocaleString()}`;
    }
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
            position: 'topright'
        }).addTo(map);

        control.on("markgeocode", (e) => {
            const bounds = L.latLngBounds(e.geocode.bbox);
            map.fitBounds(bounds);
        });

        return () => map.removeControl(control);
    }, [map]);
    return null;
}

/* ---------------- Map View Controls ---------------- */
function MapViewControls({ onViewChange, currentView }) {
    const views = [
        { id: 'street', name: 'Street', icon: '🗺️' },
        { id: 'satellite', name: 'Satellite', icon: '🛰️' },
        { id: 'dark', name: 'Dark', icon: '🌙' },
        { id: 'terrain', name: 'Terrain', icon: '🏔️' }
    ];

    return (
        <div className="leaflet-top leaflet-right m-3 mt-16">
            <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-2 text-center">Map View</div>
                    <div className="space-y-1">
                        {views.map(view => (
                            <button
                                key={view.id}
                                onClick={() => onViewChange(view.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                                    currentView === view.id
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-base">{view.icon}</span>
                                <span>{view.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------- Fit & Recenter ---------------- */
function FitResultsButton({ bounds }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => bounds?.isValid() && map.fitBounds(bounds, { padding: [50, 50] })}
            className="leaflet-top leaflet-left m-3 px-3 py-2 rounded-md bg-white/95 backdrop-blur border border-gray-200 shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
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
            onClick={() => map.setView(DEFAULT_CENTER, Math.max(map.getZoom(), 6))}
            className="leaflet-top leaflet-left m-3 mt-[70px] px-3 py-2 rounded-md bg-white/95 backdrop-blur border border-gray-200 shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            title="Recenter to default"
        >
            <span>🎯</span>
            Recenter
        </button>
    );
}

/* ---------------- Locate Me ---------------- */
function LocateMeButton() {
    const map = useMap();
    const [isLocating, setIsLocating] = useState(false);

    const onClick = () => {
        if (!navigator.geolocation) return;

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 14);
                setIsLocating(false);

                // Add a temporary marker for user location
                L.marker([latitude, longitude])
                    .addTo(map)
                    .bindTooltip("You are here!", { permanent: false, direction: 'top' })
                    .openTooltip();
            },
            () => {
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLocating}
            className="leaflet-top leaflet-right m-3 mt-[70px] px-3 py-2 rounded-md bg-white/95 backdrop-blur border border-gray-200 shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Locate me"
        >
            {isLocating ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
                <span>📍</span>
            )}
            {isLocating ? 'Locating...' : 'Locate Me'}
        </button>
    );
}

/* ---------------- Tile Layers ---------------- */
const tileLayers = {
    street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    },
    dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
};

/* ---------------- Main Component ---------------- */
export default function MapView({ property_listing = [], onMarkerClick }) {
    const [selected, setSelected] = useState(null);
    const [typeFilter, setTypeFilter] = useState(() => new Set());
    const [currentView, setCurrentView] = useState('street');
    const [showFilters, setShowFilters] = useState(true);

    // Unique types (pretty labels)
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
        return (property_listing || []).filter((l) => typeFilter.has(l?.property?.property_type));
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
                    if (latlng) out.push({ kind: "marker", latlng, listing });
                } else if (c?.type === "polygon") {
                    let ring = c?.coordinates?.geometry?.coordinates?.[0];
                    if (!Array.isArray(ring)) ring = c?.coordinates;
                    const latlngs = Array.isArray(ring) ? ring.map(toLatLng).filter(Boolean) : [];
                    if (latlngs.length >= 3) out.push({ kind: "polygon", latlngs, listing });
                }
            });
        });
        return out;
    }, [filteredListings]);

    const bounds = useMemo(() => {
        const b = L.latLngBounds([]);
        items.forEach((it) => {
            if (it.kind === "marker") b.extend(it.latlng);
            if (it.kind === "polygon") it.latlngs.forEach((pt) => b.extend(pt));
        });
        return b;
    }, [items]);

    // Counts by type for legend
    const counts = useMemo(() => {
        const agg = {};
        filteredListings.forEach((l) => {
            const t = (l?.property?.property_type || "other").toLowerCase();
            agg[t] = (agg[t] || 0) + 1;
        });
        return agg;
    }, [filteredListings]);

    const handleMarkerClick = (listing) => {
        if (onMarkerClick) onMarkerClick(listing);
        else setSelected(listing);
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
                {/* Base Tile Layer */}
                <TileLayer
                    {...tileLayers[currentView]}
                />

                <ZoomControl position="topright" />
                <GeocoderControl />

                {/* Markers & polygons */}
                {items.map((it, idx) => {
                    const prop = it.listing?.property;

                    if (it.kind === "marker") {
                        const icon = getIconByType(prop?.property_type);
                        const price = formatPrice(prop?.price);

                        return (
                            <Marker
                                key={`m-${prop?.id}-${idx}`}
                                position={it.latlng}
                                icon={icon}
                                eventHandlers={{ click: () => handleMarkerClick(it.listing) }}
                            >
                                <Tooltip direction="top" offset={[0, -50]} opacity={1} className="custom-tooltip">
                                    <div className="text-xs min-w-[200px]">
                                        <div className="font-semibold text-gray-800 mb-1">{prop?.title || "Property"}</div>
                                        <div className="text-primary font-bold mb-1">{price}</div>
                                        <div className="text-gray-600 text-xs">{prop?.address || "Location not specified"}</div>
                                        <div className="mt-1">
                                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${
                                                prop?.property_type === 'land' ? 'bg-green-100 text-green-800' :
                                                    prop?.property_type === 'condo' ? 'bg-purple-100 text-purple-800' :
                                                        prop?.property_type === 'commercial' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-blue-100 text-blue-800'
                                            }`}>
                                                {prop?.property_type || 'Property'}
                                            </span>
                                        </div>
                                    </div>
                                </Tooltip>
                            </Marker>
                        );
                    }

                    if (it.kind === "polygon") {
                        const col = colorByType(it.listing?.property?.property_type);
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
                                <Tooltip sticky direction="top" opacity={1} className="custom-tooltip">
                                    <div className="text-xs min-w-[200px]">
                                        <div className="font-semibold text-gray-800 mb-1">{p?.title || "Property Area"}</div>
                                        <div className="text-primary font-bold mb-1">{formatPrice(p?.price)}</div>
                                        {p?.address && <div className="text-gray-600 text-xs">{p.address}</div>}
                                    </div>
                                </Tooltip>
                            </Polygon>
                        );
                    }

                    return null;
                })}
            </MapContainer>

            {/* Legend + Filters */}
            {showFilters && (
                <div className="absolute left-3 top-3 z-[1000] space-y-2">
                    {/* Results Counter */}
                    <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-800">Properties Found</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-2xl font-bold text-primary">{filteredListings.length}</div>
                        <div className="text-xs text-gray-500">of {property_listing.length} total</div>
                    </div>

                    {/* Type Filters */}
                    {types.length > 0 && (
                        <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg px-4 py-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">Filter by Type</h3>
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
                                    const count = counts[t.toLowerCase()] || 0;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => toggleType(t)}
                                            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                                                active
                                                    ? "bg-primary text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: active ? 'white' : colorByType(t) }}
                                                />
                                                {t}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
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
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Legend</h3>
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
                                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                alt={selected?.property?.title || "Property"}
                                className="w-20 h-20 rounded-lg object-cover ring-1 ring-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                                    {selected?.property?.title || "Property"}
                                </div>
                                <div className="text-xs text-gray-600 mb-2 line-clamp-1">
                                    {selected?.property?.address || "—"}
                                </div>
                                <div className="text-primary font-bold text-lg mb-3">
                                    {formatPrice(selected?.property?.price)}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/maps/property/${selected?.property?.id}`}
                                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                                    >
                                        View Details
                                    </Link>
                                    {(() => {
                                        const m = (selected?.property?.coordinate || []).find((c) => c?.type === "marker");
                                        const ll = toLatLng(m?.coordinates);
                                        const href = ll ? `https://www.google.com/maps/dir/?api=1&destination=${ll[0]},${ll[1]}` : null;
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
                                onClick={() => setSelected(null)}
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
