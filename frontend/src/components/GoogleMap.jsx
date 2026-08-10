import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

function GoogleMapComponent({ workers = [] }) {
  const [selectedWorker, setSelectedWorker] = useState(null);

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

  const workerLocation =
    workers.length > 0 &&
    workers[0].latitude &&
    workers[0].longitude
      ? {
          lat: Number(workers[0].latitude),
          lng: Number(workers[0].longitude),
        }
      : {
          lat: 31.5204,
          lng: 74.3587,
        };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={workerLocation}
      zoom={15}
    >
      {workers.map((worker) => (
        <Marker
          key={worker.id}
          position={{
            lat: Number(worker.latitude),
            lng: Number(worker.longitude),
          }}
          title={worker.user?.name || "Worker"}
          onClick={() => setSelectedWorker(worker)}
        />
      ))}

      {selectedWorker && (
        <InfoWindow
          position={{
            lat: Number(selectedWorker.latitude),
            lng: Number(selectedWorker.longitude),
          }}
          onCloseClick={() => setSelectedWorker(null)}
        >
          <div className="p-2 min-w-[220px]">
            <h3 className="text-lg font-bold text-gray-800">
              👷 {selectedWorker.user?.name || "Worker"}
            </h3>

            <p className="text-gray-600 mt-2">
              📍 {selectedWorker.city || "City not available"}
            </p>

            <p className="text-gray-600 mt-1">
              ⭐ Rating: {selectedWorker.rating ?? "N/A"}
            </p>

            <p className="text-gray-600 mt-1">
              🛠 Experience:{" "}
              {selectedWorker.experience_years ?? 0} years
            </p>

            <p className="text-green-600 font-semibold mt-2">
              🟢 Online
            </p>

            {selectedWorker.services &&
              selectedWorker.services.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-700">
                    Services:
                  </p>

                  <ul className="list-disc ml-5 text-gray-600">
                    {selectedWorker.services.map((service) => (
                      <li key={service.id}>
                        {service.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default GoogleMapComponent;