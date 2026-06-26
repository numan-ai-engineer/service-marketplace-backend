import { useEffect, useState } from "react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/customer/dashboard/", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Dashboard Data:", data);

        if (data.bookings) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <h3>No Bookings Found</h3>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "10px",
            }}
          >
            <h3>{booking.service?.name}</h3>

            <p>Status: {booking.status}</p>

            <p>Worker: {booking.worker?.name}</p>

            <p>Date: {booking.created_at}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;