import {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, useState, useEffect } from "react";
import   logo  from '../../assets/framer_logo.png'

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: logo,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -40],
});

// Base and overlay tile definitions
const TILE_LAYERS = {
    Satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "© Esri, Maxar, Earthstar Geographics",
    },
    Street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "© OpenStreetMap contributors",
    },
    Labels: {
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        attribution: "© Esri",
    },
};

// TileLayer manager
const TileLayerManager = ({ base, showLabels }) => {
    const map = useMap();

    useEffect(() => {
        const baseLayer = new L.TileLayer(TILE_LAYERS[base].url, {
            attribution: TILE_LAYERS[base].attribution,
        });
        baseLayer.addTo(map);

        return () => {
            map.removeLayer(baseLayer);
        };
    }, [base, map]);

    useEffect(() => {
        let labelLayer;

        if (showLabels) {
            labelLayer = new L.TileLayer(TILE_LAYERS.Labels.url, {
                attribution: TILE_LAYERS.Labels.attribution,
            });
            labelLayer.addTo(map);
        }

        return () => {
            if (labelLayer) map.removeLayer(labelLayer);
        };
    }, [showLabels, map]);

    return null;
};

const PropertyMap = ({ coordinates }) => {
    const [mapType, setMapType] = useState("Street");
    const [labelsVisible, setLabelsVisible] = useState(true);

    const markerItem = coordinates?.find((c) => c.type === "marker");
    const polygonItem = coordinates?.find((c) => c.type === "polygon");

    const markerCoords = markerItem?.coordinates
        ? [
            parseFloat(markerItem.coordinates.lat),
            parseFloat(markerItem.coordinates.lng),
        ]
        : null;

    const polygonCoords =
        polygonItem?.coordinates?.geometry?.coordinates?.[0]?.map(
            ([lng, lat]) => [lat, lng]
        ) || [];

    const center = markerCoords || polygonCoords[0] || [13.9407, 121.6151];
    const zoomLevel = markerCoords
        ? 15
        : polygonCoords.length > 0
            ? 16
            : 12;

    const polygonOptions = {
        color: "#2563eb",
        weight: 3,
        fillColor: "#60a5fa",
        fillOpacity: 0.5,
        smoothFactor: 1,
    };

    const polygons = useMemo(
        () =>
            coordinates?.filter((item) => item.type === "polygon").map((item, idx) => {
                const coords = item.coordinates?.geometry?.coordinates?.[0];
                if (!coords) return null;
                const latlngs = coords.map(([lng, lat]) => [lat, lng]);

                return (
                    <Polygon
                        key={`polygon-${idx}`}
                        positions={latlngs}
                        pathOptions={polygonOptions}
                    />
                );
            }) || [],
        [coordinates]
    );

    const markers = useMemo(
        () =>
            coordinates?.filter((item) => item.type === "marker").map((item, idx) => {
                const { lat, lng } = item.coordinates || {};
                if (!lat || !lng) return null;

                return (
                    <Marker
                        key={`marker-${idx}`}
                        position={[parseFloat(lat), parseFloat(lng)]}
                        icon={customIcon}
                    >
                        <Popup>📍 Property Location</Popup>
                    </Marker>
                );
            }) || [],
        [coordinates]
    );

    if (!coordinates || coordinates.length === 0) return null;

    return (
        <div className="relative">
            {/* Custom map style controls */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-col md:flex-row gap-2 bg-white bg-opacity-90 rounded-md shadow-md p-2">
                <button
                    aria-label="Satellite View"
                    onClick={() => setMapType("Satellite")}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition ${
                        mapType === "Satellite"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                    🛰 Satellite
                </button>
                <button
                    aria-label="Street View"
                    onClick={() => setMapType("Street")}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition ${
                        mapType === "Street"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                    🛣 Street
                </button>
                <button
                    aria-label="Toggle Labels"
                    onClick={() => setLabelsVisible(!labelsVisible)}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition ${
                        labelsVisible
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                    🏷 {labelsVisible ? "Labels On" : "Labels Off"}
                </button>
            </div>

            <MapContainer
                center={center}
                zoom={zoomLevel}
                scrollWheelZoom={false}
                zoomControl={false} // disable default zoom control (we'll reposition it manually)
                style={{
                    height: "400px",
                    width: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    position: "relative",
                    zIndex: 0,
                }}
            >
                {/* Zoom control repositioned to bottom right */}
                <TileLayerManager base={mapType} showLabels={labelsVisible} />
                <TileLayer
                    url={TILE_LAYERS[mapType].url}
                    attribution={TILE_LAYERS[mapType].attribution}
                />
                <ZoomControl position="bottomright" />
                {polygons}
                {markers}
            </MapContainer>
        </div>
    );
};

// Import ZoomControl separately
import { ZoomControl } from "react-leaflet";

export default PropertyMap;
