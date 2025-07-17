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

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl,
    shadowUrl: iconShadow,
});




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

    const getPolygonColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'land':
                return '#A8D5BA'; // soft green
            case 'house':
                return '#FFD59E'; // soft orange
            case 'condo':
                return '#CDB4DB'; // soft purple
            default:
                return '#AEDFF7'; // soft blue
        }
    };


    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCurrentPos([latitude, longitude]);
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

    useEffect(() => {
        const bounds = [];

        properties.forEach((property) => {
            property.coordinate.forEach((c) => {
                if (c.type === 'marker') {
                    const lat = parseFloat(c.coordinates.lat ?? c.coordinates[1]);
                    const lng = parseFloat(c.coordinates.lng ?? c.coordinates[0]);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        bounds.push([lat, lng]);
                    }
                }

                if (c.type === 'polygon') {
                    const rings = c.coordinates?.geometry?.coordinates?.[0];
                    if (Array.isArray(rings)) {
                        const latlngs = rings.map(([lng, lat]) => {
                            if (isNaN(lat) || isNaN(lng)) return null;
                            return [lat, lng];
                        }).filter(Boolean);

                        bounds.push(...latlngs);
                    }
                }
            });
        });

        if (bounds.length) {
            setAllBounds(bounds);
        }
    }, [properties]);

    if (!currentPos) {
        return <div className="text-center mt-6 text-gray-600">📍 Locating you...</div>;
    }



    return (
        <div className="w-full">
            <MapContainer
                center={currentPos}
                zoom={14}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                zoomControl={true}
                dragging={true}
                style={{ height: '30vh', width: '100%' }}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                <FitBounds bounds={allBounds} />

                <Marker position={currentPos}>
                    <Popup>You are here 📍</Popup>
                </Marker>

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

                            const latlngs = rings.map(([lng, lat]) => {
                                if (isNaN(lat) || isNaN(lng)) return null;
                                return [lat, lng];
                            }).filter(Boolean);

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
                                    <Popup>{property.title}</Popup>
                                </Polygon>

                            );
                        }

                        return null;
                    })
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;
