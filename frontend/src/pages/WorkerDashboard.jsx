import { useEffect, useState } from "react";
import GoogleMapComponent from "../components/GoogleMap";

function WorkerDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [workers, setWorkers] = useState([]);

  const [isOnline, setIsOnline] = useState(false);

  const [verification, setVerification] = useState({
    cnic: "",
    cnic_front: null,
    cnic_back: null,
    selfie: null,
  });

  const [preview, setPreview] = useState({
    cnic_front: "",
    cnic_back: "",
    selfie: "",
  });

  const loadDashboard = async () => {
  const token = localStorage.getItem("access");

  const response = await fetch(
    "http://127.0.0.1:8000/api/worker/dashboard/",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    console.log(await response.text());
    return;
  }

  const data = await response.json();

setDashboard(data);
setIsOnline(data.is_online);

// Load online workers for Google Map
const workersResponse = await fetch(
  "http://127.0.0.1:8000/api/workers/",
  {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
);

if (workersResponse.ok) {
  const workersData = await workersResponse.json();

  console.log("DASHBOARD WORKERS:", workersData);

  setWorkers(workersData);
}
};

// =========================
// LOAD DASHBOARD EVERY 10 SECONDS
// =========================

useEffect(() => {
  loadDashboard();

  const interval = setInterval(() => {
    loadDashboard();
  }, 10000);

  return () => {
    clearInterval(interval);
  };
}, []);


// =========================
// UPDATE WORKER LOCATION
// =========================

const updateLocation = async (latitude, longitude) => {
  const token = localStorage.getItem("access");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/worker/update-location/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      }
    );

    const data = await response.json();

    console.log("LOCATION UPDATE STATUS:", response.status);
    console.log("LOCATION UPDATE RESPONSE:", data);

  } catch (error) {
    console.log("Location Update Error:", error);
  }
};


// =========================
// GPS LOCATION TRACKING
// =========================

useEffect(() => {
  if (!navigator.geolocation) {
    console.log(
      "Geolocation is not supported by this browser."
    );
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log(
        "GPS LOCATION:",
        latitude,
        longitude
      );

      updateLocation(
        latitude,
        longitude
      );
    },

    (error) => {
      console.log(
        "GPS ERROR CODE:",
        error.code
      );

      console.log(
        "GPS ERROR MESSAGE:",
        error.message
      );
    },

    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 30000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}, []);

  const updateStatus = async (bookingId, status) => {
    const token = localStorage.getItem("access");

    const response = await fetch(
      `http://127.0.0.1:8000/api/bookings/${bookingId}/status/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    loadDashboard();
  };

  const toggleOnlineStatus = async () => {

     console.log("BUTTON CLICKED");

     console.log("Current isOnline:", isOnline);
console.log("Sending:", !isOnline);

  const token = localStorage.getItem("access");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/worker/online-status/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          is_online: !isOnline,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setIsOnline(data.is_online);

      alert(data.message);

      loadDashboard();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
    alert("Server Error");
  }
};

  const uploadVerification = async () => {
  const token = localStorage.getItem("access");

  console.log("🚀 UPLOAD VERIFICATION BUTTON CLICKED");

  const formData = new FormData();

  formData.append("cnic", verification.cnic);

  if (verification.cnic_front) {
    formData.append(
      "cnic_front",
      verification.cnic_front
    );
  }

  if (verification.cnic_back) {
    formData.append(
      "cnic_back",
      verification.cnic_back
    );
  }

  if (verification.selfie) {
    formData.append(
      "selfie",
      verification.selfie
    );
  }

  console.log("CNIC:", verification.cnic);
  console.log("CNIC FRONT:", verification.cnic_front);
  console.log("CNIC BACK:", verification.cnic_back);
  console.log("SELFIE:", verification.selfie);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/worker/upload-verification/",
      {
        method: "POST",

        headers: {
          Authorization: "Bearer " + token,
        },

        body: formData,
      }
    );

    console.log(
      "UPLOAD RESPONSE STATUS:",
      response.status
    );

    const data = await response.json();

    console.log(
      "UPLOAD RESPONSE DATA:",
      data
    );

    if (response.ok) {
      alert(
        data.message ||
        "Verification uploaded successfully."
      );

      loadDashboard();
    } else {
      alert(
        data.error ||
        data.detail ||
        "Verification upload failed."
      );
    }

  } catch (error) {

    console.error(
      "UPLOAD VERIFICATION ERROR:",
      error
    );

    alert(
      "Server Error. Please try again."
    );
  }
};

if (!dashboard) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-blue-600">
        Loading...
      </h2>
    </div>
  );
}
return (
  <div className="min-h-screen bg-gray-100 p-6">

    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-3xl p-8 shadow-2xl mb-10 text-white">

  <div className="flex flex-col md:flex-row justify-between items-center">

    <div className="flex items-center gap-6">

      <div className="w-24 h-24 rounded-full bg-white text-blue-700 flex items-center justify-center text-5xl font-bold shadow-lg">

        👷

      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 mt-8">
  <h2 className="text-2xl font-bold mb-4">
    📍 Live Worker Location
  </h2>

  <GoogleMapComponent workers={workers} />
</div>

      <div>

        <h1 className="text-4xl font-extrabold">
          Welcome, {dashboard.worker}
        </h1>

        <div className="mt-4">
  <button
  onClick={toggleOnlineStatus}
    className={`px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition
    ${
      isOnline
        ? "bg-red-600 hover:bg-red-700"
        : "bg-green-600 hover:bg-green-700"
    }`}
  >
    {isOnline ? "🔴 Go Offline" : "🟢 Go Online"}
  </button>
</div>

        <p className="text-blue-100 mt-2 text-lg">
          Professional Worker Dashboard
        </p>

        <p className="text-blue-200 mt-1">
          Manage bookings • Verify account • Grow your business
        </p>

      </div>

    </div>

    <div className="mt-6 md:mt-0 text-center">

      <div className="bg-white/20 rounded-2xl px-6 py-4">

        <p className="text-blue-100">
          Current Rating
        </p>

        <h2 className="text-4xl font-bold">

          ⭐ {dashboard.rating}

        </h2>

      </div>

    </div>

  </div>

</div>

   
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

  <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition duration-300 border-l-8 border-yellow-400">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500">Rating</p>
        <h2 className="text-4xl font-extrabold text-yellow-500 mt-2">
          ⭐ {dashboard.rating}
        </h2>
      </div>
      <div className="text-5xl">⭐</div>
    </div>
  </div>

  <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition duration-300 border-l-8 border-blue-500">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500">Reviews</p>
        <h2 className="text-4xl font-extrabold text-blue-600 mt-2">
          {dashboard.total_reviews}
        </h2>
      </div>
      <div className="text-5xl">📝</div>
    </div>
  </div>

  <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition duration-300 border-l-8 border-gray-600">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500">Total Jobs</p>
        <h2 className="text-4xl font-extrabold mt-2">
          {dashboard.total}
        </h2>
      </div>
      <div className="text-5xl">📅</div>
    </div>
  </div>

  <div className="bg-yellow-50 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition border-l-8 border-yellow-500">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-600">Pending</p>
        <h2 className="text-4xl font-bold text-yellow-600 mt-2">
          {dashboard.pending}
        </h2>
      </div>
      <div className="text-5xl">⏳</div>
    </div>
  </div>

  <div className="bg-green-50 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition border-l-8 border-green-500">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-600">Accepted</p>
        <h2 className="text-4xl font-bold text-green-600 mt-2">
          {dashboard.accepted}
        </h2>
      </div>
      <div className="text-5xl">✅</div>
    </div>
  </div>

  <div className="bg-blue-50 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition border-l-8 border-blue-600">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-600">Completed</p>
        <h2 className="text-4xl font-bold text-blue-700 mt-2">
          {dashboard.completed}
        </h2>
      </div>
      <div className="text-5xl">🎉</div>
    </div>
  </div>

</div>

<div className="bg-white rounded-3xl shadow-xl p-8 mb-10">

  <h2 className="text-2xl font-bold mb-2">
    🪪 Identity Verification
  </h2>

  <p className="text-gray-500 mb-8">
    Upload your CNIC and selfie for account verification.
  </p>

  <div className="mb-6">

<label className="block font-semibold mb-2">
CNIC Number
</label>

<input
type="text"
value={verification.cnic}
onChange={(e)=>
setVerification({
...verification,
cnic:e.target.value,
})
}
placeholder="35202-1234567-1"
className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
/>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">

  <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center hover:border-blue-500 transition">

  <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-4xl mb-4">
  📄
</div>

  <h3 className="font-bold text-lg">
    CNIC Front
  </h3>

  <p className="text-gray-500 text-sm mt-2 mb-4">
    Upload Front Side of CNIC
  </p>

  <input
    type="file"
    className="block w-full text-sm
    file:mr-4
    file:py-2
    file:px-4
    file:rounded-xl
    file:border-0
    file:bg-blue-600
    file:text-white
    hover:file:bg-blue-700"
    onChange={(e)=>
      setVerification({
        ...verification,
        cnic_front:e.target.files[0],
      })
    }
  />

</div>

<div className="border-2 border-dashed border-green-300 rounded-2xl p-6 text-center hover:border-green-500 transition">

  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-4xl mb-4">
  📄
</div>

  <h3 className="font-bold text-lg">
    CNIC Back
  </h3>

  <p className="text-gray-500 text-sm mt-2 mb-4">
    Upload Back Side of CNIC
  </p>

  <input
    type="file"
    className="block w-full text-sm
    file:mr-4
    file:py-2
    file:px-4
    file:rounded-xl
    file:border-0
    file:bg-green-600
    file:text-white
    hover:file:bg-green-700"
    onChange={(e)=>
      setVerification({
        ...verification,
        cnic_back:e.target.files[0],
      })
    }
  />

</div>

<div className="border-2 border-dashed border-purple-300 rounded-2xl p-6 text-center hover:border-purple-500 transition">

  <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-4xl mb-4">
  🤳
</div>

  <h3 className="font-bold text-lg">
    Selfie Verification
  </h3>

  <p className="text-gray-500 text-sm mt-2 mb-4">
    Upload a clear selfie for identity verification
  </p>

  <input
    type="file"
    className="block w-full text-sm
    file:mr-4
    file:py-2
    file:px-4
    file:rounded-xl
    file:border-0
    file:bg-purple-600
    file:text-white
    hover:file:bg-purple-700"
    onChange={(e) =>
      setVerification({
        ...verification,
        selfie: e.target.files[0],
      })
    }
  />

</div>
</div>

<div className="mt-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl">

  <h2 className="text-2xl font-bold text-white mb-2">
    🚀 Submit Verification
  </h2>

  <p className="text-blue-100 mb-6">
    Your documents will be reviewed by our verification team.
    Verification usually takes less than 24 hours.
  </p>

  <button
    onClick={uploadVerification}
    className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl text-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
  >
    ✅ Upload & Verify My Account
  </button>

</div>

<div className="mt-12 mb-6">
  <h2 className="text-3xl font-bold text-gray-800">
    📋 My Booking Requests
  </h2>

  <p className="text-gray-500 mt-2">
    Manage all incoming service requests.
  </p>
</div>

{[...dashboard.bookings]
  .sort((a, b) => Number(b.id) - Number(a.id))
  .map((booking, index) => (

    <div
      key={booking.id}
      className={`bg-white rounded-3xl shadow-xl border p-7 mb-8 transition duration-300
        ${
          index === 0
            ? "border-4 border-green-400"
            : "border-gray-200"
        }
      `}
    >

      <div className="flex justify-between items-center mb-6">

        <div>

          {index === 0 && (
            <span className="inline-block mb-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              🆕 MOST RECENT BOOKING
            </span>
          )}

          <h2 className="text-2xl font-bold text-gray-800">
            🔧 {booking.service.name}
          </h2>

          <p className="text-gray-500 mt-1">
            Booking #{booking.id}
          </p>

        </div>

        <span
          className={`px-5 py-2 rounded-full text-sm font-bold
            ${
              booking.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : booking.status === "accepted"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }
          `}
        >
          {booking.status.toUpperCase()}
        </span>

      </div>

      <hr className="mb-5" />

      <div className="space-y-3">

        <p className="text-lg">
          👤{" "}
          <span className="font-semibold">
            {booking.customer.name}
          </span>
        </p>

        <p>
          📞 {booking.customer.phone}
        </p>

        <p>
          📍 {booking.address || "Address not provided"}
        </p>

        {booking.created_at && (
          <p>
            📅{" "}
            <span className="font-semibold">
              {new Date(booking.created_at).toLocaleString()}
            </span>
          </p>
        )}

      </div>

      <div className="mt-8">

        {booking.status === "pending" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

    <button
      onClick={() =>
        updateStatus(booking.id, "accepted")
      }
      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 font-bold shadow-md"
    >
      ✅ Accept Booking
    </button>

    <button
      onClick={() =>
        updateStatus(booking.id, "rejected")
      }
      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3 font-bold shadow-md"
    >
      ❌ Reject Booking
    </button>

  </div>
)}

        {booking.status === "accepted" && (
          <button
            onClick={() =>
              updateStatus(booking.id, "completed")
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-bold shadow-md"
          >
            ✔ Mark as Completed
          </button>
        )}

        {booking.status === "completed" && (
          <div className="w-full bg-blue-100 text-blue-700 rounded-2xl py-3 text-center font-bold">
            🎉 Booking Completed
          </div>
        )}

        {booking.status === "rejected" && (
          <div className="w-full bg-red-100 text-red-700 rounded-2xl py-3 text-center font-bold">
            ❌ Booking Rejected
          </div>
        )}

        {booking.status === "cancelled" && (
          <div className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 text-center font-bold">
            🚫 Booking Cancelled
          </div>
        )}

      </div>

    </div>

  ))}

</div>

</div>

);
}

export default WorkerDashboard;