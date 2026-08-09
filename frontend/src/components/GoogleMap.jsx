import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 31.5204,
  lng: 74.3587,
};

function GoogleMapComponent({ workers = [] }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-red-600 font-semibold">
          Google Maps failed to load.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-blue-600 font-semibold">
          Loading map...
        </p>
      </div>
    );
  }

  return (
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
          title={worker.user?.name || "Worker"}
        />
      ))}
    </GoogleMap>
  );
}

export default GoogleMapComponent;