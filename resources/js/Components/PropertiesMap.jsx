import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (deg) => deg * (Math.PI / 180);
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const PropertiesMap = ({ properties }) => {
    const [currentPos, setCurrentPos] = useState(null);
    const [filteredProps, setFilteredProps] = useState([]);

    useEffect(() => {
        if (!navigator.geolocation) {
            alert('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
            () => alert('Unable to get location')
        );
    }, []);

    useEffect(() => {
        if (!currentPos) return;

        const filtered = properties.filter((property) => {
            const marker = property.coordinate.find((c) => c.type === 'marker');
            if (!marker) return false;

            const lat = parseFloat(marker.coordinates.lat ?? marker.coordinates[1]);
            const lng = parseFloat(marker.coordinates.lng ?? marker.coordinates[0]);

            const dist = getDistanceFromLatLonInMeters(currentPos[0], currentPos[1], lat, lng);
            return dist <= 50000000;
        });

        setFilteredProps(filtered);
    }, [currentPos, properties]);

    if (!currentPos) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading your location...</p>;

    return (
        <div
            style={{
                maxWidth: 1000,
                margin: '2rem auto',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: '#fff',
            }}
        >
            <header
                style={{
                    backgroundColor: '#0055a5',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span>Properties Nearby</span>
                <span
                    style={{
                        backgroundColor: '#ffd700',
                        color: '#0055a5',
                        borderRadius: '9999px',
                        padding: '0.3rem 0.9rem',
                        fontWeight: '700',
                        fontSize: '1rem',
                        minWidth: 40,
                        textAlign: 'center',
                        boxShadow: '0 0 5px #ffd700',
                    }}
                >
                    {filteredProps.length}
                </span>
            </header>

            <MapContainer
                center={currentPos}
                zoom={16}
                style={{ height: 550, width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                <Circle center={currentPos} radius={50000000} pathOptions={{ color: '#0055a5', fillOpacity: 0.1 }} />

                <Marker position={currentPos}>
                    <Popup>
                        <strong>Your Location</strong>
                    </Popup>
                </Marker>

                {filteredProps.map((property) => {
                    const marker = property.coordinate.find((c) => c.type === 'marker');
                    const lat = parseFloat(marker.coordinates.lat ?? marker.coordinates[1]);
                    const lng = parseFloat(marker.coordinates.lng ?? marker.coordinates[0]);

                    return (
                        <Marker key={property.id} position={[lat, lng]}>
                            <Popup>
                                <div style={{
                                    fontSize: '0.95rem',
                                    lineHeight: '1.3',
                                    maxWidth: '220px',
                                    overflowWrap: 'break-word'
                                }}>
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            marginBottom: '0.5rem',
                                        }}
                                    />
                                    <strong>{property.title}</strong><br />
                                    <span>₱{parseFloat(property.price).toLocaleString()}</span><br />
                                    <small style={{ color: '#555' }}>{property.address}</small><br />
                                    <a
                                        href={`/property/${property.id}`}
                                        style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            backgroundColor: '#0055a5',
                                            color: 'white',
                                            padding: '0.4rem 0.8rem',
                                            fontSize: '0.85rem',
                                            borderRadius: 4,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        View Details
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default PropertiesMap;
