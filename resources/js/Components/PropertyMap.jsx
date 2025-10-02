// components/PropertyMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
    ZoomControl,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logo from "../../assets/framer_logo.png";

/* -----------------------------
   small utils
------------------------------*/
const cn = (...c) => c.filter(Boolean).join(" ");
const toNum = (v) => (v == null ? null : Number(v));
const isLatLng = (lat, lng) =>
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

/* -----------------------------
   Tile sources
------------------------------*/
const TILE_LAYERS = {
    Satellite: {
        url:
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "© Esri, Maxar, Earthstar Geographics",
    },
    Street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "© OpenStreetMap contributors",
    },
    Labels: {
        url:
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        attribution: "© Esri",
    },
};

/* -----------------------------
   DivIcon with logo
------------------------------*/
const makeLogoDivIcon = () =>
    L.divIcon({
        className: "mjvi-logo-marker",
        html: `
      <div style="
        width:42px;height:42px;display:flex;align-items:center;justify-content:center;
        border-radius:9999px;background:white;box-shadow:0 6px 14px rgba(0,0,0,.18);
        border:2px solid rgba(16,185,129,.4);position:relative;
      ">
        <img src="${logo}" alt="Marker" style="width:26px;height:26px;object-fit:contain"/>
        <span style="
          position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
          width:10px;height:10px;background:#10b981;border-radius:9999px;border:1px solid #fff;
          box-shadow:0 2px 6px rgba(16,185,129,.6);
        "></span>
      </div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -36],
    });

/* -----------------------------
   Tile layer manager
------------------------------*/
function TileLayerManager({ base, showLabels }) {
    const map = useMap();

    useEffect(() => {
        const baseLayer = L.tileLayer(TILE_LAYERS[base].url, {
            attribution: TILE_LAYERS[base].attribution,
            className: "mjvi-base-tiles",
        });
        baseLayer.addTo(map);
        return () => map.removeLayer(baseLayer);
    }, [base, map]);

    useEffect(() => {
        let labelLayer;
        if (showLabels) {
            labelLayer = L.tileLayer(TILE_LAYERS.Labels.url, {
                attribution: TILE_LAYERS.Labels.attribution,
                className: "mjvi-label-tiles",
            });
            labelLayer.addTo(map);
        }
        return () => {
            if (labelLayer) map.removeLayer(labelLayer);
        };
    }, [showLabels, map]);

    return null;
}

/* -----------------------------
   Fit-to-bounds helper
------------------------------*/
function FitToBounds({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            // add small padding for aesthetics
            map.fitBounds(bounds, { padding: [24, 24] });
        }
    }, [bounds, map]);
    return null;
}

/* -----------------------------
   Main component
   coordinates: [
     { type: "marker", coordinates: { lat, lng } },
     { type: "polygon", coordinates: { geometry: { coordinates: [ [ [lng, lat], ... ] ] } } }
   ]
------------------------------*/
export default function PropertyMap({ coordinates = [] }) {
    const [mapType, setMapType] = useState("Street");
    const [labelsVisible, setLabelsVisible] = useState(true);

    // Parse markers
    const markers = useMemo(() => {
        return coordinates
            .filter((i) => i?.type === "marker")
            .map((i) => {
                const lat = toNum(i?.coordinates?.lat);
                const lng = toNum(i?.coordinates?.lng);
                return isLatLng(lat, lng) ? [lat, lng] : null;
            })
            .filter(Boolean);
    }, [coordinates]);

    // Parse polygons (GeoJSON-like: [[lng,lat], ...])
    const polygons = useMemo(() => {
        return coordinates
            .filter((i) => i?.type === "polygon")
            .map((i) => {
                const coords = i?.coordinates?.geometry?.coordinates?.[0];
                if (!Array.isArray(coords)) return null;
                const latlngs = coords
                    .map(([lng, lat]) => [toNum(lat), toNum(lng)])
                    .filter(([lat, lng]) => isLatLng(lat, lng));
                return latlngs.length ? latlngs : null;
            })
            .filter(Boolean);
    }, [coordinates]);

    // Bounds (include all polygon points and markers)
    const bounds = useMemo(() => {
        const pts = [
            ...markers,
            ...polygons.flatMap((poly) => poly), // flatten polygon points
        ];
        if (!pts.length) return null;
        return L.latLngBounds(pts);
    }, [markers, polygons]);

    // Initial center if no bounds
    const defaultCenter = [13.9407, 121.6151];
    const logoIconRef = useRef(makeLogoDivIcon());

    // Polygon style + hover interactivity
    const basePolyStyle = {
        color: "#2563eb",
        weight: 2.5,
        fillColor: "#60a5fa",
        fillOpacity: 0.45,
        pane: "overlayPane",
    };

    const handlePolyMouseOver = (e) => {
        const layer = e.target;
        layer.setStyle({
            weight: 3.5,
            fillOpacity: 0.58,
            color: "#1d4ed8",
        });
        // Bring to front so outline is crisp
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    };

    const handlePolyMouseOut = (e) => {
        const layer = e.target;
        layer.setStyle(basePolyStyle);
    };

    const firstMarker = markers[0] || null;

    // Early return if nothing to draw is okay, but a map with default center looks nicer
    const hasAnyGeometry = markers.length || polygons.length;

    return (
        <div className="relative">
            {/* Controls */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-sm rounded-lg p-2">
                <button
                    aria-label="Satellite View"
                    title="Satellite View"
                    onClick={() => setMapType("Satellite")}
                    className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition",
                        mapType === "Satellite"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    )}
                >
                    🛰 Satellite
                </button>
                <button
                    aria-label="Street View"
                    title="Street View"
                    onClick={() => setMapType("Street")}
                    className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition",
                        mapType === "Street"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    )}
                >
                    🛣 Street
                </button>
                <button
                    aria-label="Toggle Labels"
                    title="Toggle Labels"
                    onClick={() => setLabelsVisible((s) => !s)}
                    className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition",
                        labelsVisible
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    )}
                >
                    🏷 {labelsVisible ? "Labels On" : "Labels Off"}
                </button>

                {/* Quick tools */}
                <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />
                <button
                    aria-label="Fit to bounds"
                    title="Fit to bounds"
                    onClick={() => {
                        const evt = new Event("fit-bounds");
                        window.dispatchEvent(evt);
                    }}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-white border hover:bg-gray-50"
                >
                    Fit
                </button>
            </div>

            <MapContainer
                center={bounds ? bounds.getCenter() : defaultCenter}
                zoom={bounds ? undefined : 12}
                scrollWheelZoom={false}
                zoomControl={false}
                style={{
                    height: 420,
                    width: "100%",
                    borderRadius: 12,
                    position: "relative",
                    zIndex: 0,
                    boxShadow: "0 10px 24px rgba(0,0,0,.06)",
                }}
            >
                {/* Listen for "Fit" click dispatched above */}
                <MapFitListener bounds={bounds} />

                <TileLayerManager base={mapType} showLabels={labelsVisible} />
                {/* Zoom bottom-right for cleaner composition */}
                <ZoomControl position="bottomright" />

                {/* Fit map on first render when bounds exist */}
                {bounds && <FitToBounds bounds={bounds} />}

                {/* Polygons */}
                {polygons.map((latlngs, idx) => (
                    <Polygon
                        key={`poly-${idx}`}
                        positions={latlngs}
                        pathOptions={basePolyStyle}
                        eventHandlers={{
                            mouseover: handlePolyMouseOver,
                            mouseout: handlePolyMouseOut,
                        }}
                    />
                ))}

                {/* Markers */}
                {markers.map((pos, idx) => (
                    <Marker key={`marker-${idx}`} position={pos} icon={logoIconRef.current}>
                        <Popup minWidth={160}>📍 Property Location</Popup>
                    </Marker>
                ))}

                {/* Empty fallback (still show map UI) */}
                {!hasAnyGeometry && (
                    <Popup position={defaultCenter} openOnMount>
                        No geometry provided.
                    </Popup>
                )}
            </MapContainer>
        </div>
    );
}

/* -----------------------------
   Internal: Fit action listener
------------------------------*/
function MapFitListener({ bounds }) {
    const map = useMap();
    useEffect(() => {
        const handler = () => {
            if (bounds) map.fitBounds(bounds, { padding: [24, 24] });
        };
        window.addEventListener("fit-bounds", handler);
        return () => window.removeEventListener("fit-bounds", handler);
    }, [bounds, map]);
    return null;
}
