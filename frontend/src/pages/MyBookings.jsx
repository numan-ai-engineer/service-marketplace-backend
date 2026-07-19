import { useEffect, useState } from "react";
import api from "../utils/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const submitReview = async (bookingId) => {
  try {
    const response = await api.post("/reviews/submit/", {
      booking: bookingId,
      rating: rating,
      comment: comment,
    });

    alert(response.data.message);

    window.location.reload();

  } catch (error) {

    if (error.response) {
      alert(error.response.data.error);
    } else {
      alert("Server Error");
    }

    console.log(error);
  }
};
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
            {booking.status === "completed" && (
  <div style={{ marginTop: "15px" }}>

    <h4>Leave Review</h4>

    <select
      value={rating}
      onChange={(e) => setRating(e.target.value)}
    >
      <option value="5">⭐⭐⭐⭐⭐</option>
      <option value="4">⭐⭐⭐⭐</option>
      <option value="3">⭐⭐⭐</option>
      <option value="2">⭐⭐</option>
      <option value="1">⭐</option>
    </select>

    <br />
    <br />

    <textarea
      placeholder="Write your review..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      rows={4}
      style={{ width: "100%" }}
    />

    <br />
    <br />

    <button
      onClick={() => submitReview(booking.id)}
    >
      Submit Review
    </button>

  </div>
)}
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;