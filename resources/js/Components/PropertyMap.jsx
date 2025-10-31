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
import { Maximize2, Layers, Satellite, Home, Map } from "lucide-react"; // Imported Lucide icons
import logo from "../../assets/framer_logo.png"; // Assuming this path is correct

/* -----------------------------
   small utils (Unchanged)
------------------------------*/
const cn = (...c) => c.filter(Boolean).join(" ");
const toNum = (v) => (v == null ? null : Number(v));
const isLatLng = (lat, lng) =>
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

/* -----------------------------
   Tile sources (Unchanged)
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
   DivIcon with logo (Unchanged)
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
   Tile layer manager (Unchanged)
------------------------------*/
function TileLayerManager({ base, showLabels }) {
    const map = useMap();

    useEffect(() => {
        const baseLayer = L.tileLayer(TILE_LAYERS[base].url, {
            attribution: TILE_LAYERS[base].attribution,
            // IMPROVEMENT: Added a generic class for potential custom styling if needed
            className: "mjvi-base-tiles transition-all duration-500",
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
   Fit-to-bounds helper (Unchanged)
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
------------------------------*/
export default function PropertyMap({ coordinates = [] }) {
    const [mapType, setMapType] = useState("Street");
    const [labelsVisible, setLabelsVisible] = useState(true);

    // ... (markers, polygons, bounds, defaultCenter, logoIconRef remain unchanged)
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

    const bounds = useMemo(() => {
        const pts = [
            ...markers,
            ...polygons.flatMap((poly) => poly),
        ];
        if (!pts.length) return null;
        return L.latLngBounds(pts);
    }, [markers, polygons]);

    const defaultCenter = [13.9407, 121.6151];
    const logoIconRef = useRef(makeLogoDivIcon());


    // Polygon style + hover interactivity (Unchanged, looks great)
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
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    };

    const handlePolyMouseOut = (e) => {
        const layer = e.target;
        layer.setStyle(basePolyStyle);
    };

    const hasAnyGeometry = markers.length || polygons.length;

    return (
        <div className="relative">
            {/* IMPROVEMENT: Controls: Dark background for a floating, professional look */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-1.5 bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-xl p-1.5">

                {/* Map Type Group */}
                <div className="flex bg-gray-700 rounded-lg p-0.5">
                    <button
                        aria-label="Satellite View"
                        title="Satellite View"
                        onClick={() => setMapType("Satellite")}
                        className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                            mapType === "Satellite"
                                ? "bg-primary text-white shadow-md"
                                : "text-gray-200 hover:bg-gray-600/70"
                        )}
                    >
                        <Satellite className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Satellite</span>
                    </button>
                    <button
                        aria-label="Street View"
                        title="Street View"
                        onClick={() => setMapType("Street")}
                        className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                            mapType === "Street"
                                ? "bg-primary text-white shadow-md"
                                : "text-gray-200 hover:bg-gray-600/70"
                        )}
                    >
                        <Map className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Street</span>
                    </button>
                </div>

                {/* Labels Toggle */}
                <button
                    aria-label="Toggle Labels"
                    title="Toggle Labels"
                    onClick={() => setLabelsVisible((s) => !s)}
                    className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        labelsVisible
                            ? "bg-amber-500 text-gray-900 hover:bg-amber-600 shadow-md"
                            : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    )}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{labelsVisible ? "Labels On" : "Labels Off"}</span>
                </button>

                {/* IMPROVEMENT: Fit Button integrated with an icon */}
                {bounds && (
                    <>
                        <div className="w-px h-6 bg-gray-700 mx-1 hidden md:block" />
                        <button
                            aria-label="Fit to bounds"
                            title="Fit to bounds"
                            onClick={() => {
                                // Dispatching a window event is fine for communication outside MapContainer
                                const evt = new Event("fit-bounds");
                                window.dispatchEvent(evt);
                            }}
                            className="p-2 rounded-lg text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors shadow-md"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </>
                )}
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
                    // IMPROVEMENT: Slightly deeper shadow for contrast with the floating controls
                    boxShadow: "0 12px 30px rgba(0,0,0,.1)",
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
                        <Popup minWidth={160}>
                            <div className="font-semibold text-gray-800">📍 Property Location</div>
                        </Popup>
                    </Marker>
                ))}

                {/* Empty fallback (still show map UI) */}
                {!hasAnyGeometry && (
                    <Popup position={defaultCenter} openOnMount>
                        <div className="font-semibold text-gray-800">
                            No geometry provided. Displaying default center.
                        </div>
                    </Popup>
                )}
            </MapContainer>
        </div>
    );
}

/* -----------------------------
   Internal: Fit action listener (Unchanged)
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
