import { MapContainer, TileLayer, Polygon, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const PropertyMap = ({ coordinates }) => {
  if (!coordinates || coordinates.length === 0) return null;

  // Use marker or polygon center as fallback
  const markerItem = coordinates.find(c => c.type === "marker");
  const polygonItem = coordinates.find(c => c.type === "polygon");

  const markerCoords =
    markerItem?.coordinates?.lat && markerItem?.coordinates?.lng
      ? [parseFloat(markerItem.coordinates.lat), parseFloat(markerItem.coordinates.lng)]
      : null;

  const polygonCoords = polygonItem?.coordinates?.geometry?.coordinates?.[0]?.map?.(([lng, lat]) => [lat, lng]) || [];

  const center = markerCoords || polygonCoords[0] || [13.9407, 121.6151]; // default center

  return (
    <MapContainer center={center} zoom={17} style={{ height: "400px", width: "100%", zIndex: 0, position: "relative" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {coordinates.map((item, index) => {
        if (item.type === "polygon") {
          const coords = item.coordinates?.geometry?.coordinates?.[0];
          if (!coords) return null;

          const polygonLatLngs = coords.map(([lng, lat]) => [lat, lng]);

          return <Polygon key={index} positions={polygonLatLngs} pathOptions={{ color: "blue" }} />;
        }

        if (item.type === "marker") {
          const { lat, lng } = item.coordinates || {};
          if (!lat || !lng) return null;

          return (
            <Marker key={index} position={[parseFloat(lat), parseFloat(lng)]} />
          );
        }

        return null;
      })}
    </MapContainer>
  );
};

export default PropertyMap;
