import { useEffect, useState } from "react";
import api from "../utils/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
  try {
    const response = await api.get("/customer/dashboard/");

    console.log(response.data);

    if (response.ok) {
      setBookings(response.data.bookings || []);
    }
  } catch (error) {
    console.log(error);
  }
};

loadBookings();
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