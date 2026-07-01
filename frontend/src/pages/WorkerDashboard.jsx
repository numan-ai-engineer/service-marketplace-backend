import { useEffect, useState } from "react";

function WorkerDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = () => {
    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/worker/dashboard/", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDashboard(data);
      })
      .catch((error) => console.log(error));
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

  if (!dashboard) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Worker Dashboard</h2>

      <p>Total Jobs: {dashboard.total}</p>
      <p>Pending: {dashboard.pending}</p>
      <p>Accepted: {dashboard.accepted}</p>
      <p>Completed: {dashboard.completed}</p>

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