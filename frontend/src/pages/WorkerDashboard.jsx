import { useEffect, useState } from "react";

function WorkerDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [verification, setVerification] = useState({
  cnic: "",
  cnic_front: null,
  cnic_back: null,
  selfie: null,
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

console.log("Status:", response.status);

if (!response.ok) {
  const text = await response.text();
  console.log(text);
  return;
}

const data = await response.json();

console.log(data);

setDashboard(data);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateStatus = async (bookingId, status) => {

    console.log("Booking ID:", bookingId);

  console.log("Status:", status);

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
          status: status,
        }),
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    loadDashboard();
  };

   const uploadVerification = async () => {

console.log("Upload Button Clicked");

  const token = localStorage.getItem("access");

  const formData = new FormData();

  formData.append("cnic", verification.cnic);
  formData.append("cnic_front", verification.cnic_front);
  formData.append("cnic_back", verification.cnic_back);
  formData.append("selfie", verification.selfie);

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

  const data = await response.json();

  console.log(response.status);
console.log(data);

  alert(data.message || data.error);
};

  if (!dashboard) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Worker Dashboard</h2>

    <h3>Welcome {dashboard.worker}</h3>

<hr />

<p>⭐ Average Rating: {dashboard.rating}</p>

<p>📝 Total Reviews: {dashboard.total_reviews}</p>

<hr />

<p>Total Jobs: {dashboard.total}</p>

<p>Pending Jobs: {dashboard.pending}</p>

<p>Accepted Jobs: {dashboard.accepted}</p>

<p>Completed Jobs: {dashboard.completed}</p>

      <hr />

      <h3>Worker Verification</h3>

<input
  type="text"
  placeholder="CNIC Number"
  value={verification.cnic}
  onChange={(e) =>
    setVerification({
      ...verification,
      cnic: e.target.value,
    })
  }
/>

<br /><br />

<label>CNIC Front</label>
<br />
<input
  type="file"
  onChange={(e) =>
    setVerification({
      ...verification,
      cnic_front: e.target.files[0],
    })
  }
/>

<br /><br />

<label>CNIC Back</label>
<br />
<input
  type="file"
  onChange={(e) =>
    setVerification({
      ...verification,
      cnic_back: e.target.files[0],
    })
  }
/>

<br /><br />

<label>Selfie</label>
<br />
<input
  type="file"
  onChange={(e) =>
    setVerification({
      ...verification,
      selfie: e.target.files[0],
    })
  }
/>

<br /><br />

<button onClick={uploadVerification}>
  Upload Documents
</button>

<hr />

      {dashboard.bookings.map((booking) => (
        <div
          key={booking.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "10px",
          }}
        >
          <h3>{booking.service.name}</h3>

          <p>Customer: {booking.customer.name}</p>

          <p>Status: {booking.status}</p>

          <button
            onClick={() =>
              updateStatus(booking.id, "accepted")
            }
          >
            Accept
          </button>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() =>
              updateStatus(booking.id, "completed")
            }
          >
            Complete
          </button>
        </div>
      ))}
    </div>
  );
}

export default WorkerDashboard;