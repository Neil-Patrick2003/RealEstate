import { MapContainer, TileLayer, FeatureGroup, Marker, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { useState, useRef } from 'react';

const PropertyMapDraw = ({ onChange }) => {
  const [drawnItems, setDrawnItems] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const featureGroupRef = useRef(null);

  const onCreated = (e) => {
    const layer = e.layer;
    const type = e.layerType;

    // Clear previous drawings
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

  const onDeleted = (e) => {
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

  return (
    <MapContainer center={[13.9407, 121.6151]} zoom={19} style={{ height: '500px', width: '100%' }}>
       <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        />

        {/* Labels (cities, roads, etc.) */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
        />
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
        position="topright"
        onCreated={onCreated}
        draw={{
          polygon: {},        // ✅ Correct: empty object
          polyline: false,    // ✅ Still allowed if you want to disable
          rectangle: {},      // ✅ Correct
          circle: {},         // ✅ Correct
          marker: {},         // ✅ Correct
          circlemarker: false // ✅ Disable
        }}
      />

      </FeatureGroup>
      {markerPosition && <Marker position={markerPosition} />}
    </MapContainer>
  );
};

export default PropertyMapDraw;
