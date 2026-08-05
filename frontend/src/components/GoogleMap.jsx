import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 31.5204,
  lng: 74.3587,
};

function GoogleMapComponent({ workers = [] }) {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {workers.map((worker) => (
          <Marker
            key={worker.id}
            position={{
              lat: Number(worker.latitude),
              lng: Number(worker.longitude),
            }}
            title={worker.user.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

export default GoogleMapComponent;