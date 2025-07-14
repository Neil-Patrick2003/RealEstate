import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PropertiesMap = ({ properties }) => {
    const [currentPos, setCurrentPos] = useState(null);

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

    if (!currentPos) {
        return (
            <div className="text-center text-gray-600 mt-8 text-sm">
                📍 Locating you...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-full">
            {/* Header */}
            <div className="bg-gradient-to-tl from-primary to-accent text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-base md:text-lg font-semibold">
                    <span>Properties Nearby</span>
                    <span className="bg-[#E0B52B] text-primary rounded-full px-3 py-1 text-sm font-bold min-w-[40px] text-center shadow">
            {properties.length}
          </span>
                </div>
                <span className="text-sm md:text-base font-medium text-white/90">Explore more</span>
            </div>

            {/* MapView */}
            <MapContainer
                center={currentPos}
                zoom={16}
                style={{ height: 550, width: '100%' }}
                scrollWheelZoom={true}
                className='z-0'
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* User Location */}
                <Marker position={currentPos}>
                    <Popup>
                        <div className="text-sm font-medium">📍 You are here</div>
                    </Popup>
                </Marker>

                {/* All Properties */}
                {properties.map((property) => {
                    const marker = property.coordinate.find((c) => c.type === 'marker');
                    if (!marker) return null;

                    const lat = parseFloat(marker.coordinates.lat ?? marker.coordinates[1]);
                    const lng = parseFloat(marker.coordinates.lng ?? marker.coordinates[0]);

                    return (
                        <Marker key={property.id} position={[lat, lng]}>
                            <Popup>
                                <div className="max-w-[220px] text-sm leading-relaxed">
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        className="w-full h-[100px] object-cover rounded mb-2"
                                        onError={(e) => (e.target.src = '/placeholder.png')}
                                    />
                                    <h3 className="font-semibold mb-1">{property.title}</h3>
                                    <p className="text-green-700 font-bold">₱{parseFloat(property.price).toLocaleString()}</p>
                                    <p className="text-gray-500 text-xs">{property.address}</p>
                                    <a
                                        href={`/property/${property.id}`}
                                        className="inline-block mt-2 bg-primary text-white px-3 py-1 rounded text-xs font-medium hover:bg-accent transition"
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
