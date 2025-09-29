import React, { useEffect, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    useMap,
    Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { Link } from "@inertiajs/react";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// --- ICONS ---
const houseIcon = new L.Icon({
    iconUrl: "/icon/house.png",
    iconSize: [60, 90],
    iconAnchor: [30, 65],
    popupAnchor: [0, -70],
    shadowUrl: iconShadow,
    shadowSize: [50, 50],
});

const landIcon = new L.Icon({
    iconUrl: "/icon/land.png",
    iconSize: [60, 90],
    iconAnchor: [30, 65],
    popupAnchor: [0, -30],
    shadowUrl: iconShadow,
    shadowSize: [40, 40],
});

// --- HELPERS ---
const DEFAULT_CENTER = [13.41, 122.56];

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

const getIconByType = (type) =>
    (type || "").toLowerCase() === "land" ? landIcon : houseIcon;

const colorByType = (type) => {
    switch ((type || "").toLowerCase()) {
        case "land":
            return "#28a745";
        case "condo":
            return "#c084fc";
        default:
            return "#007bff"; // house/others
    }
};

const php = (n) =>
    Number(n ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    });

// --- GEOCODER CONTROL ---
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
        }).addTo(map);

        control.on("markgeocode", function (e) {
            const bounds = L.latLngBounds(e.geocode.bbox);
            map.fitBounds(bounds);
        });

        return () => map.removeControl(control);
    }, [map]);

    return null;
}

// --- FIT TO RESULTS BUTTON ---
function FitResultsButton({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds?.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, bounds]);

    const onClick = () => bounds?.isValid() && map.fitBounds(bounds, { padding: [50, 50] });

    return (
        <button
            type="button"
            onClick={onClick}
            className="leaflet-top leaflet-left m-3 px-3 py-1.5 rounded-md bg-white/95 border border-gray-200 shadow text-sm hover:bg-gray-50"
            title="Fit to results"
        >
            Fit to results
        </button>
    );
}

// --- RECENTER TO DEFAULT BUTTON ---
function RecenterButton() {
    const map = useMap();
    const onClick = () => map.setView(DEFAULT_CENTER, Math.max(map.getZoom(), 6));
    return (
        <button
            type="button"
            onClick={onClick}
            className="leaflet-top leaflet-left m-3 mt-[50px] px-3 py-1.5 rounded-md bg-white/95 border border-gray-200 shadow text-sm hover:bg-gray-50"
            title="Recenter to default"
        >
            Recenter
        </button>
    );
}

// --- MAIN ---
export default function MapView({ property_listing = [], onMarkerClick }) {
    // Precompute shapes + bounds safely
    const items = useMemo(() => {
        const out = [];
        (property_listing || []).forEach((listing) => {
            const prop = listing?.property;
            const coords = prop?.coordinate || [];
            coords.forEach((c) => {
                if (c?.type === "marker") {
                    const latlng = toLatLng(c.coordinates);
                    if (latlng) out.push({ kind: "marker", latlng, listing });
                } else if (c?.type === "polygon") {
                    // Supports GeoJSON { geometry.coordinates[0] } or raw array
                    let ring = c?.coordinates?.geometry?.coordinates?.[0];
                    if (!Array.isArray(ring)) ring = c?.coordinates;
                    const latlngs = Array.isArray(ring) ? ring.map(toLatLng).filter(Boolean) : [];
                    if (latlngs.length >= 3) out.push({ kind: "polygon", latlngs, listing });
                }
            });
        });
        return out;
    }, [property_listing]);

    const bounds = useMemo(() => {
        const b = L.latLngBounds([]);
        items.forEach((it) => {
            if (it.kind === "marker") b.extend(it.latlng);
            if (it.kind === "polygon") it.latlngs.forEach((pt) => b.extend(pt));
        });
        return b;
    }, [items]);

    // Quick legend counts
    const counts = useMemo(() => {
        const agg = { house: 0, land: 0, other: 0 };
        property_listing.forEach((l) => {
            const t = (l?.property?.property_type || "").toLowerCase();
            if (t === "land") agg.land++;
            else if (t === "house") agg.house++;
            else agg.other++;
        });
        return agg;
    }, [property_listing]);

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

                {/* Render shapes */}
                {items.map((it, idx) => {
                    const prop = it.listing?.property;
                    if (it.kind === "marker") {
                        const icon = getIconByType(prop?.property_type);
                        const img = prop?.image_url ? `/storage/${prop.image_url}` : "/images/placeholder.jpg";
                        const price = prop?.price != null ? php(prop.price) : "Price N/A";
                        const addr = prop?.address;
                        const lat = it.latlng[0];
                        const lng = it.latlng[1];
                        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                        return (
                            <Marker
                                key={`m-${prop?.id}-${idx}`}
                                position={it.latlng}
                                icon={icon}
                                eventHandlers={{ click: () => onMarkerClick?.(it.listing) }}
                            >
                                <Popup autoPan>
                                    <div className="max-w-[230px] text-sm leading-relaxed">
                                        <img
                                            src={img}
                                            alt={prop?.title || "Property"}
                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                            className="w-full h-[110px] object-cover rounded mb-2 border border-gray-200"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <h3 className="font-semibold mb-1 line-clamp-2">
                                            {prop?.title || "Untitled Property"}
                                        </h3>
                                        <p className="text-emerald-700 font-bold">{price}</p>
                                        {addr && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{addr}</p>}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Link
                                                href={`/maps/property/${prop?.id}`}
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
                        // 🛠️ Bugfix: use the *property* type for color
                        const col = colorByType(it.listing?.property?.property_type);
                        const p = it.listing?.property;

                        return (
                            <Polygon
                                key={`g-${p?.id}-${idx}`}
                                positions={it.latlngs}
                                pathOptions={{ color: col, fillColor: col, fillOpacity: 0.35 }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <div className="font-semibold">{p?.title || "Property Area"}</div>
                                        {p?.address && <div className="text-gray-600 text-xs mt-1">{p.address}</div>}
                                        <Link
                                            href={`/maps/property/${p?.id}`}
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

            {/* Legend / counts overlay */}
            <div className="absolute left-3 top-3 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-2 text-xs text-gray-700">
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
        </div>
    );
}
