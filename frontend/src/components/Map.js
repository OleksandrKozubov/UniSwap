import { MapContainer, TileLayer, Marker } from "react-leaflet";

function Map({ lat, lng }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className="listing-map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}

export default Map;
