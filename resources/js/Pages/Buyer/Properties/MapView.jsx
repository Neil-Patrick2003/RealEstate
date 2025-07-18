import React, { useEffect, useRef } from "react";
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
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Custom house icon
const houseIcon = new L.Icon({
    iconUrl: "/icon/house.png",
    iconSize: [60, 90],
    iconAnchor: [30, 65], // horizontally center, bottom aligned
    popupAnchor: [0, -70],
    shadowUrl: iconShadow,
    shadowSize: [50, 50],
});

const landIcon = new L.Icon({
    iconUrl: "/icon/land.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const DEFAULT_CENTER = [13.41, 122.56];

function GeocoderControl() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const geocoder = L.Control.Geocoder.nominatim();
        const control = L.Control.geocoder({
            query: '',
            placeholder: 'Search location...',
            defaultMarkGeocode: true,
            geocoder,
        }).addTo(map);

        control.on("markgeocode", function (e) {
            const bbox = e.geocode.bbox;
            const bounds = L.latLngBounds(bbox);
            map.fitBounds(bounds);
        });

        return () => map.removeControl(control);
    }, [map]);

    return null;
}

function FitBoundsControl({ property_listing }) {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds([]);

        property_listing.forEach((property) => {
            property.property.coordinate.forEach((c) => {
                if (c.type === "marker") {
                    const lat = parseFloat(c.coordinates.lat ?? c.coordinates[1]);
                    const lng = parseFloat(c.coordinates.lng ?? c.coordinates[0]);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        bounds.extend([lat, lng]);
                    }
                }

                if (c.type === "polygon") {
                    const polygon = c.coordinates?.geometry?.coordinates?.[0];
                    if (Array.isArray(polygon)) {
                        polygon.forEach(([lng, lat]) => {
                            if (!isNaN(lat) && !isNaN(lng)) {
                                bounds.extend([lat, lng]);
                            }
                        });
                    }
                }
            });
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, property_listing]);

    return null;
}

export default function MapView({ property_listing = [], onMarkerClick }) {
    const getPolygonColor = (type) => {
        return type === "land" ? "#28a745" : "#007bff";
    };

    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={6}
            scrollWheelZoom={true}
            style={{ height: "93vh", width: "100%" }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <ZoomControl position="topright" />
            <GeocoderControl />
            <FitBoundsControl property_listing={property_listing} />

            {property_listing.map((property) =>
                property.property.coordinate.map((c, index) => {
                    if (c.type === "marker") {
                        const lat = parseFloat(c.coordinates.lat ?? c.coordinates[1]);
                        const lng = parseFloat(c.coordinates.lng ?? c.coordinates[0]);
                        if (isNaN(lat) || isNaN(lng)) return null;

                        const icon =
                            property.property_type?.toLowerCase() === "land"
                                ? landIcon
                                : houseIcon;

                        return (
                            <Marker
                                key={`${property.id}-marker-${index}`}
                                position={[lat, lng]}
                                icon={icon}
                                eventHandlers={{
                                    click: () => onMarkerClick?.(property),
                                }}
                            >
                                <Popup>{property.title || "Property"}</Popup>
                            </Marker>
                        );
                    }

                    if (c.type === "polygon") {
                        const polygon = c.coordinates?.geometry?.coordinates?.[0];
                        if (!Array.isArray(polygon)) return null;

                        const latlngs = polygon
                            .map(([lng, lat]) => {
                                const parsedLat = parseFloat(lat);
                                const parsedLng = parseFloat(lng);
                                return !isNaN(parsedLat) && !isNaN(parsedLng)
                                    ? [parsedLat, parsedLng]
                                    : null;
                            })
                            .filter(Boolean);

                        return (
                            <Polygon
                                key={`${property.id}-polygon-${index}`}
                                positions={latlngs}
                                pathOptions={{
                                    color: getPolygonColor(property.property_type),
                                    fillColor: getPolygonColor(property.property_type),
                                    fillOpacity: 0.4,
                                }}
                            >
                                <Popup>{property.title || "Property Area"}</Popup>
                            </Polygon>
                        );
                    }

                    return null;
                })
            )}
        </MapContainer>
    );
}
