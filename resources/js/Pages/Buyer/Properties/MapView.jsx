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

const getIconByType = (type) =>
    (type || "").toLowerCase() === "land" ? landIcon : houseIcon;

const colorByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return "#28a745";
        case "condo":
            return "#c084fc";
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
            geocoder
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
    useEffect(() => {
        if (bounds?.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, bounds]);

    return (
        <button
            type="button"
            onClick={() => bounds?.isValid() && map.fitBounds(bounds, { padding: [50, 50] })}
            className="leaflet-top leaflet-left m-3 px-3 py-1.5 rounded-md bg-white/95 border border-gray-200 shadow text-sm hover:bg-gray-50"
            title="Fit to results"
        >
            Fit to results
        </button>
    );
}

function RecenterButton() {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => map.setView(DEFAULT_CENTER, Math.max(map.getZoom(), 6))}
            className="leaflet-top leaflet-left m-3 mt-[50px] px-3 py-1.5 rounded-md bg-white/95 border border-gray-200 shadow text-sm hover:bg-gray-50"
            title="Recenter to default"
        >
            Recenter
        </button>
    );
}

/* ---------------- Locate Me ---------------- */
function LocateMeButton() {
    const map = useMap();
    const onClick = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 14);
            },
            () => {
                // silently ignore
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="leaflet-top leaflet-right m-3 px-3 py-1.5 rounded-md bg-white/95 border border-gray-200 shadow text-sm hover:bg-gray-50"
            title="Locate me"
        >
            Locate me
        </button>
    );
}

/* ---------------- Main ---------------- */
export default function MapView({ property_listing = [], onMarkerClick }) {
    const [selected, setSelected] = useState(null);
    const [typeFilter, setTypeFilter] = useState(() => new Set()); // empty = all

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

    // Quick counts for legend
    const counts = useMemo(() => {
        const agg = { house: 0, land: 0, other: 0 };
        filteredListings.forEach((l) => {
            const t = (l?.property?.property_type || "").toLowerCase();
            if (t === "land") agg.land++;
            else if (t === "house") agg.house++;
            else agg.other++;
        });
        return agg;
    }, [filteredListings]);

    const handleMarkerClick = (listing) => {
        if (onMarkerClick) onMarkerClick(listing);
        else setSelected(listing); // fallback overlay card
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

    return (
        <div className="relative">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={6}
                scrollWheelZoom
                style={{ height: "93vh", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                <ZoomControl position="topright" />
                <GeocoderControl />
                <FitResultsButton bounds={bounds} />
                <RecenterButton />
                <LocateMeButton />

                {/* Markers & polygons */}
                {items.map((it, idx) => {
                    const prop = it.listing?.property;

                    if (it.kind === "marker") {
                        const icon = getIconByType(prop?.property_type);
                        const price = prop?.price != null ? php(prop.price) : "Price N/A";

                        return (
                            <Marker
                                key={`m-${prop?.id}-${idx}`}
                                position={it.latlng}
                                icon={icon}
                                eventHandlers={{ click: () => handleMarkerClick(it.listing) }}
                            >
                                {/* Hover tooltip only (no click popups) */}
                                <Tooltip direction="top" offset={[0, -50]} opacity={1} className="rounded-md shadow-sm">
                                    <div className="text-xs">
                                        <div className="font-semibold text-gray-800">{prop?.title || "Property"}</div>
                                        <div className="text-gray-600">{price}</div>
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
                                pathOptions={{ color: col, fillColor: col, fillOpacity: 0.35 }}
                            >
                                {/* Keep popup for area shapes (clicking the ICON still has no popup) */}
                                <Tooltip sticky direction="top" opacity={1} className="rounded-md shadow-sm">
                                    <div className="text-xs">
                                        <div className="font-semibold text-gray-800">{p?.title || "Property Area"}</div>
                                        {p?.address && <div className="text-gray-600 mt-1">{p.address}</div>}
                                    </div>
                                </Tooltip>
                            </Polygon>
                        );
                    }

                    return null;
                })}
            </MapContainer>

            {/* Legend + Filters */}
            <div className="absolute left-3 top-3 z-[1000] space-y-2">
                <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-2 text-xs text-gray-700">
                    <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: "#007bff" }} />
              House: {counts.house}
            </span>
                        <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: "#28a745" }} />
              Land: {counts.land}
            </span>
                        <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: "#c084fc" }} />
              Other: {counts.other}
            </span>
                    </div>
                </div>

                {types.length > 0 && (
                    <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-2">
                        <p className="text-[11px] text-gray-500 mb-1">Filter types</p>
                        <div className="flex flex-wrap gap-1.5">
                            {types.map((t) => {
                                const active = typeFilter.has(t);
                                return (
                                    <button
                                        key={t}
                                        onClick={() => toggleType(t)}
                                        className={`px-2.5 py-1 rounded-full text-[11px] border transition ${
                                            active
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                        }`}
                                        title={`Toggle ${t}`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                            {typeFilter.size > 0 && (
                                <button
                                    onClick={() => setTypeFilter(new Set())}
                                    className="ml-1 px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    title="Clear filters"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Fallback bottom card (used only if onMarkerClick not passed) */}
            {!onMarkerClick && selected && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-[1100] w-[92vw] sm:w-[520px]">
                    <div className="bg-white rounded-xl shadow-xl ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex gap-3 p-3">
                            <img
                                src={
                                    selected?.property?.image_url
                                        ? `/storage/${selected.property.image_url}`
                                        : "/images/placeholder.jpg"
                                }
                                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                alt={selected?.property?.title || "Property"}
                                className="w-24 h-24 rounded object-cover ring-1 ring-gray-200"
                            />
                            <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                    {selected?.property?.title || "Property"}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                    {selected?.property?.address || "—"}
                                </div>
                                <div className="text-emerald-600 font-bold mt-1">
                                    {php(selected?.property?.price)}
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Link
                                        href={`/maps/property/${selected?.property?.id}`}
                                        className="px-3 py-1.5 rounded-md bg-primary text-white text-sm hover:bg-accent"
                                    >
                                        View details
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
                                                className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                                            >
                                                Directions
                                            </a>
                                        ) : null;
                                    })()}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="ml-auto h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
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
