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

function GoogleMapComponent({
  workers = [],
  customerLocation = null,
  showBookingButton = false,
  onBookWorker,
}) {

  const [selectedWorker, setSelectedWorker] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // =========================================
  // GOOGLE MAP LOADING ERROR
  // =========================================

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-red-600 font-semibold">
          Google Maps failed to load.
        </p>
      </div>
    );
  }

  // =========================================
  // GOOGLE MAP LOADING
  // =========================================

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-blue-600 font-semibold">
          Loading map...
        </p>
      </div>
    );
  }

 // =========================================
// MAP CENTER LOCATION
// =========================================

const validWorkers = workers.filter((worker) => {
  const latitude = Number(worker.latitude);
  const longitude = Number(worker.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
});

const firstWorker = validWorkers[0];

const firstWorkerLocation = firstWorker
  ? {
      lat: Number(firstWorker.latitude),
      lng: Number(firstWorker.longitude),
    }
  : null;

const mapCenter = customerLocation
  ? {
      lat: Number(customerLocation.latitude),
      lng: Number(customerLocation.longitude),
    }
  : firstWorkerLocation || {
      lat: 31.5204,
      lng: 74.3587,
    };

  // =========================================
  // RENDER MAP
  // =========================================

  return (
    <GoogleMap
  mapContainerStyle={containerStyle}
  center={mapCenter}
  zoom={15}
>

  {/* =======================================
    CUSTOMER LOCATION MARKER
======================================= */}

{customerLocation && (
  <Marker
    position={{
      lat: Number(customerLocation.latitude),
      lng: Number(customerLocation.longitude),
    }}
    title="Your Location"
  />
)}
      {/* =======================================
          WORKER MARKERS
      ======================================= */}

      {validWorkers.map((worker) => {

        const latitude = Number(worker.latitude);
        const longitude = Number(worker.longitude);

        // Ignore invalid GPS coordinates
        if (
          Number.isNaN(latitude) ||
          Number.isNaN(longitude)
        ) {
          return null;
        }

        return (
          <Marker
  key={worker.worker_id ?? worker.id}
  position={{
    lat: latitude,
    lng: longitude,
  }}
  title={
    worker.user?.name ||
    worker.worker ||
    "Worker"
  }
  onClick={() => setSelectedWorker(worker)}
/>
        );
      })}

      {/* =======================================
          WORKER INFORMATION WINDOW
      ======================================= */}

      {selectedWorker && (
        <InfoWindow
          position={{
            lat: Number(selectedWorker.latitude),
            lng: Number(selectedWorker.longitude),
          }}
          onCloseClick={() => setSelectedWorker(null)}
        >
          <div className="p-2 min-w-[220px]">

            {/* WORKER NAME */}

            <h3 className="text-lg font-bold text-gray-800">
              👷{" "}
              {selectedWorker.user?.name ||
                selectedWorker.worker ||
                "Worker"}
            </h3>

            {/* CITY */}

            <p className="text-gray-600 mt-2">
              📍{" "}
              {selectedWorker.city ||
                "City not available"}
            </p>

            {/* RATING */}

            <p className="text-gray-600 mt-1">
              ⭐ Rating:{" "}
              {selectedWorker.rating ?? "N/A"}
            </p>

            {/* EXPERIENCE */}

            <p className="text-gray-600 mt-1">
              🛠 Experience:{" "}
              {selectedWorker.experience_years ??
                selectedWorker.experience ??
                0}{" "}
              years
            </p>

            {/* DISTANCE */}

            {selectedWorker.distance_km !==
              undefined && (
              <p className="text-blue-600 mt-1">
                📏 Distance:{" "}
                {selectedWorker.distance_km} km
              </p>
            )}

            {/* ONLINE STATUS */}

            <p className="text-green-600 font-semibold mt-2">
              🟢 Online
            </p>

            {/* SERVICES */}

            {selectedWorker.services &&
              selectedWorker.services.length > 0 && (
                <div className="mt-2">

                  <p className="font-semibold text-gray-700">
                    Services:
                  </p>

                  <ul className="list-disc ml-5 text-gray-600">

                    {selectedWorker.services.map(
                      (service, index) => (
                        <li
                          key={
                            service.id ?? index
                          }
                        >
                          {typeof service ===
                          "object"
                            ? service.name
                            : service}
                        </li>
                      )
                    )}

                  </ul>

                </div>
              )}

            {/* BOOK BUTTON */}

            {showBookingButton && (
              <button
                onClick={() => {

                  console.log(
                    "BOOK WORKER CLICKED:",
                    selectedWorker
                  );

                  if (onBookWorker) {
                    onBookWorker(
                      selectedWorker
                    );
                  }

                }}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                📅 Book This Worker
              </button>
            )}

          </div>
        </InfoWindow>
      )}

    </GoogleMap>
  );
}

export default GoogleMapComponent;