import { MapContainer, TileLayer, FeatureGroup, Marker, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { useState, useRef, useEffect } from 'react';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const SearchControl = ({ onSearch }) => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: true,
            showPopup: false,
            marker: {
                icon: new L.Icon.Default(),
                draggable: false,
            },
            maxMarkers: 1,
            retainZoomLevel: false,
            animateZoom: true,
            autoClose: true,
            searchLabel: 'Enter address',
            keepResult: false,
        });

        map.addControl(searchControl);

        // Optional: listen to results
        map.on('geosearch/showlocation', (result) => {
            const latlng = result.location;
            if (onSearch) {
                onSearch(latlng);
            }
        });

        return () => map.removeControl(searchControl);
    }, [map, onSearch]);

    return null;
};

const PropertyMapDraw = ({ onChange, boundary, pin }) => {
    const [markerPosition, setMarkerPosition] = useState(pin || null);
    const featureGroupRef = useRef(null);

    console.log(boundary);
    console.log(pin);


    // Load existing boundary & pin
    useEffect(() => {
        const group = featureGroupRef.current;
        if (!group) return;

        group.clearLayers();

        if (boundary) {
            const layer = L.geoJSON(boundary);
            layer.eachLayer(l => group.addLayer(l));
        }

        if (pin) {
            setMarkerPosition(pin);
        } else {
            setMarkerPosition(null);
        }
    }, [boundary, pin]);

    const onCreated = (e) => {
        const layer = e.layer;
        const type = e.layerType;

        const group = featureGroupRef.current;
        if (group) {
            group.clearLayers();
            group.addLayer(layer);
        }

        if (type === 'polygon' || type === 'rectangle') {
            const geojson = layer.toGeoJSON();
            const center = layer.getBounds().getCenter();
            setMarkerPosition(center);
            if (onChange) onChange({ boundary: geojson, pin: center });
        }

        if (type === 'marker') {
            const latlng = layer.getLatLng();
            setMarkerPosition(latlng);
            if (onChange) onChange({ pin: latlng });
        }
    };

    const MapCenter = ({ position, zoom = 19 }) => {
        const map = useMap();

        useEffect(() => {
            if (!position) return;

            // Accept either L.LatLng or [lat, lng]
            const target =
                Array.isArray(position) ? position : [position.lat, position.lng];

            // Smooth center (you can use map.setView for instant)
            map.flyTo(target, zoom, { animate: true });
        }, [position, zoom, map]);

        return null;
    };

    const onDeleted = () => {
        setMarkerPosition(null);
        if (onChange) onChange({ boundary: null, pin: null });
    };

    const onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const geojson = layer.toGeoJSON();
            const center = layer.getBounds().getCenter();
            setMarkerPosition(center);
            if (onChange) onChange({ boundary: geojson, pin: center });
        });
    };

    const handleSearchResult = (latlng) => {
        const position = L.latLng(latlng.y, latlng.x);
        setMarkerPosition(position);
        if (onChange) onChange({ pin: position });
    };

    return (
        <MapContainer center={[13.9407, 121.6151]} zoom={19} style={{ height: '600px', width: '100%', borderRadius: '8px' }}>
            <SearchControl onSearch={handleSearchResult} />
            <MapCenter position={markerPosition} zoom={18} />


            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
            />

            <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution="Labels © Esri"
            />

            <FeatureGroup ref={featureGroupRef}>
                <EditControl
                    position="topright"
                    onCreated={onCreated}
                    onDeleted={onDeleted}
                    onEdited={onEdited}
                    draw={{
                        polygon: {},
                        polyline: false,
                        rectangle: {},
                        circle: {},
                        marker: {},
                        circlemarker: false,
                    }}
                />
            </FeatureGroup>

            {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
    );
};

export default PropertyMapDraw;
