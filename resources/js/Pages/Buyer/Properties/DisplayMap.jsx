import React, { useEffect, useRef, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polygon,
    Popup,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link  } from '@inertiajs/react';

// Default Leaflet marker icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Reset default icon globally
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl,
    shadowUrl: iconShadow,
});

// Custom Icons
const houseIcon = new L.Icon({
    iconUrl: '/icon/house.png',
    iconSize: [85, 120],
    iconAnchor: [50, 77],
    popupAnchor: [1, -40],
    shadowUrl: iconShadow,
    shadowSize: [50, 50],
});

const landIcon = new L.Icon({
    iconUrl: '/icon/land.png',
    iconSize: [85, 120],
    iconAnchor: [50, 77],
    popupAnchor: [1, -40],
    shadowUrl: iconShadow,
    shadowSize: [50, 50],
});

const getIconByType = (type) => {
    switch (type?.toLowerCase()) {
        case 'land':
            return landIcon;
        case 'house':
        default:
            return houseIcon;
    }
};

// Auto-fit bounds helper
const FitBounds = ({ bounds }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds.length > 0) {
            const leafletBounds = L.latLngBounds(bounds);
            map.fitBounds(leafletBounds, { padding: [50, 50] });
        }
    }, [bounds, map]);

    return null;
};

const MapView = ({ properties = [], onMarkerClick }) => {
    const [currentPos, setCurrentPos] = useState(null);
    const mapRef = useRef(null);
    const [allBounds, setAllBounds] = useState([]);

    // Color based on property type
    const getPolygonColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'land':
                return '#A8D5BA';
            case 'house':
                return '#FFD59E';
            case 'condo':
                return '#CDB4DB';
            default:
                return '#AEDFF7';
        }
    };

    // Get user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    setCurrentPos([coords.latitude, coords.longitude]);
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    alert('Unable to access your location.');
                }
            );
        } else {
            alert('Geolocation not supported by your browser.');
        }
    }, []);

    // Compute bounds for all items
    useEffect(() => {
        const bounds = properties.flatMap((property) =>
            property.coordinate.flatMap((c) => {
                if (c.type === 'marker') {
                    const lat = parseFloat(c.coordinates.lat ?? c.coordinates[1]);
                    const lng = parseFloat(c.coordinates.lng ?? c.coordinates[0]);
                    return !isNaN(lat) && !isNaN(lng) ? [[lat, lng]] : [];
                }

                if (c.type === 'polygon') {
                    const rings = c.coordinates?.geometry?.coordinates?.[0];
                    if (!Array.isArray(rings)) return [];
                    return rings
                        .map(([lng, lat]) => (!isNaN(lat) && !isNaN(lng) ? [lat, lng] : null))
                        .filter(Boolean);
                }

                return [];
            })
        );

        if (bounds.length > 0) {
            setAllBounds(bounds);
        }
    }, [properties]);

    if (!currentPos) {
        return <div className="text-center mt-6 text-gray-600">📍 Locating you...</div>;
    }

    return (
        <div className="relative w-full">
            {/* Map */}
            <MapContainer
                center={currentPos}
                zoom={14}
                scrollWheelZoom
                doubleClickZoom={false}
                zoomControl
                dragging
                style={{ height: '30vh', width: '100%' }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Fit all markers/polygons initially */}
                <FitBounds bounds={allBounds} />

                {/* User location */}
                <Marker position={currentPos}>
                    <Popup>You are here 📍</Popup>
                </Marker>

                {/* Render property markers/polygons */}
                {properties.map((property) =>
                    property.coordinate.map((c, index) => {
                        if (c.type === 'marker') {
                            const lat = parseFloat(c.coordinates.lat ?? c.coordinates[1]);
                            const lng = parseFloat(c.coordinates.lng ?? c.coordinates[0]);
                            if (isNaN(lat) || isNaN(lng)) return null;

                            return (
                                <Marker
                                    key={`${property.id}-marker-${index}`}
                                    position={[lat, lng]}
                                    icon={getIconByType(property.property_type)}
                                    eventHandlers={{
                                        click: () => onMarkerClick?.(property),
                                    }}
                                >
                                    <Popup>{property.title || 'Property Marker'}</Popup>
                                </Marker>
                            );
                        }

                        if (c.type === 'polygon') {
                            const rings = c.coordinates?.geometry?.coordinates?.[0];
                            if (!Array.isArray(rings)) return null;

                            const latlngs = rings
                                .map(([lng, lat]) => (!isNaN(lat) && !isNaN(lng) ? [lat, lng] : null))
                                .filter(Boolean);

                            return (
                                <Polygon
                                    key={`${property.id}-polygon-${index}`}
                                    positions={latlngs}
                                    pathOptions={{
                                        color: getPolygonColor(property.property_type),
                                        fillColor: getPolygonColor(property.property_type),
                                        fillOpacity: 0.3,
                                    }}
                                >
                                    <Popup>{property.title || 'Property Area'}</Popup>
                                </Polygon>
                            );
                        }

                        return null;
                    })
                )}
            </MapContainer>

            {/* View All Button */}
            <div className="absolute top-4 right-4 z-[1000]">
                <Link href='/maps'

                    className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-accent transition"
                >
                    View All on Map
                </Link>
            </div>
        </div>
    );
};

export default MapView;
