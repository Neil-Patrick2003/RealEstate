import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ properties, onMarkerClick }) => {
    const [currentPos, setCurrentPos] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mapRef = useRef(null);

    console.log(properties);
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

    const handleSearch = async () => {
        if (!searchTerm) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`
            );
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                const newCoords = [parseFloat(lat), parseFloat(lon)];
                if (mapRef.current) {
                    mapRef.current.setView(newCoords, 14);
                }
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Error fetching location.');
        }
    };

    if (!currentPos) {
        return <div className="text-center mt-6 text-gray-600">📍 Locating you...</div>;
    }

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={currentPos}
                zoom={14}
                scrollWheelZoom
                style={{ height: '100%', width: '100%' }}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                <Marker position={currentPos}>
                    <Popup>You are here 📍</Popup>
                </Marker>

                {/* Render Markers and Polygons */}
                {properties.map((property) =>
                    property.coordinate.map((c, index) => {
                        if (c.type === 'marker') {
                            const lat = parseFloat(c.coordinates.lat ?? c.coordinates[1]);
                            const lng = parseFloat(c.coordinates.lng ?? c.coordinates[0]);

                            return (
                                <Marker
                                    key={`${property.id}-marker-${index}`}
                                    position={[lat, lng]}
                                    eventHandlers={{
                                        click: () => onMarkerClick && onMarkerClick(property),
                                    }}
                                />
                            );
                        }

                        return null;
                    })
                )}
            </MapContainer>

            {/* Top Overlay Search + Filters */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-white/90 backdrop-blur shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-base md:text-lg font-semibold text-primary">
                        <span>All Properties</span>
                        <span className="bg-yellow-400 text-primary rounded-full px-3 py-1 text-sm font-bold min-w-[40px] text-center">
                            {properties.length}
                        </span>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-black px-3 py-2 rounded border border-gray-300 w-full md:w-80"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-primary text-white px-4 py-2 rounded font-semibold shadow hover:bg-accent transition"
                        >
                            Search
                        </button>

                        <select className="py-2 px-3 rounded-md border border-gray-300 bg-white text-black">
                            <option>All</option>
                            <option>House</option>
                            <option>Land</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;
