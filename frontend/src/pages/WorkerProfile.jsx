import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Card,
  Badge,
  Form,
  Button,
} from "react-bootstrap";

import api from "../utils/api";

function WorkerProfile() {
  const { id } = useParams();

  const [worker, setWorker] = useState(null);

  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [bookingId, setBookingId] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);

const [isEditing, setIsEditing] = useState(false);

console.log("isEditing =", isEditing);

  useEffect(() => {
    loadWorker();
  }, [id]);

  useEffect(() => {
    if (worker) {
      loadReviews();
      loadBooking();
    }
  }, [worker]);
  const loadWorker = async () => {
  const response = await api.get(`/workers/${id}/`);

  console.log("Worker:", response);

  if (response.ok) {
    setWorker(response.data);
  }
};

const loadReviews = async () => {
  const response = await api.get("/reviews/");

  console.log("Reviews:", response);

  if (response.ok) {
    const workerReviews = response.data.filter(
      (review) => review.worker == id
    );
    console.log(workerReviews);

    setReviews(workerReviews);
  }
};

const loadBooking = async () => {
  if (!worker) return;

  const token = localStorage.getItem("access");

  const response = await api.get("/bookings/", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  console.log("Bookings:", response);

  if (response.ok) {
    const booking = response.data.find(
      (b) =>
        b.worker.id == worker.user.id &&
        b.status === "completed"
    );

    if (booking) {
      setBookingId(booking.id);
      console.log("Booking ID:", booking.id);
    }
  }
};

const submitReview = async (e) => {
  e.preventDefault();

  console.log("Booking ID:", bookingId);
  console.log("Rating:", rating);
  console.log("Comment:", comment);

  const token = localStorage.getItem("access");

  if (!bookingId) {
    alert("No completed booking found.");
    return;
  }

 let response;

if (isEditing) {
  response = await api.patch(
    `/reviews/${editingReviewId}/`,
    {
      rating: Number(rating),
      comment: comment,
    }
  );
} else {
  response = await api.post(
    "/reviews/",
    {
      booking: bookingId,
      rating: Number(rating),
      comment: comment,
    }
  );
}

  console.log(response);
  console.log("Status:", response.status);
  console.log("Data:", response.data);

if (response.ok) {
  alert(
    isEditing
      ? "Review Updated Successfully!"
      : "Review Submitted Successfully!"
  );

  setIsEditing(false);
  setEditingReviewId(null);

  setRating(5);
  setComment("");

  loadReviews();
} else {
  console.log(response);
  alert(JSON.stringify(response.data));
}
};

const deleteReview = async (reviewId) => {

  console.log("Deleting Review ID:", reviewId);
  const token = localStorage.getItem("access");

  const response = await api.delete(
    `/reviews/${reviewId}/`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  console.log(response);

if (response.ok) {
  alert("Review Deleted Successfully!");
  loadReviews();
} else {
  console.log(response);
  alert(JSON.stringify(response.data));
}
};

if (!worker) {
  return <h2 className="text-center mt-5">Loading...</h2>;
}


return (
  <Container className="mt-5">
    <Card className="shadow p-4">

      <h2 className="mb-4">Worker Profile</h2>

      <h4>👷 {worker.user.name}</h4>

      <p className="mt-3">📞 {worker.user.phone}</p>

      <p>📍 {worker.city}</p>

      <p>⭐ Rating: {worker.rating}</p>

      <p>💼 Experience: {worker.experience_years} Years</p>

      <p>
        Availability:{" "}
        {worker.is_available ? (
          <Badge bg="success">Available</Badge>
        ) : (
          <Badge bg="danger">Not Available</Badge>
        )}
      </p>

      <div className="mt-3">
        <strong>Services:</strong>
        <br />
        {worker.services.map((service, index) => (
          <Badge
            bg="primary"
            className="me-2 mt-2"
            key={index}
          >
            {service}
          </Badge>
        ))}
      </div>

      <hr className="my-4" />

      <h4>Write a Review</h4>

      <Form className="mt-3" onSubmit={submitReview}>
        <Form.Group className="mb-3">
          <Form.Label>Rating</Form.Label>

          <Form.Select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Comment</Form.Label>

          <Form.Control
            as="textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
          />
        </Form.Group>

        <Button variant="primary" type="submit">
  {isEditing ? "Update Review" : "Submit Review"}
</Button>
      </Form>
 

      <hr className="my-4" />

      <h4>Customer Reviews</h4>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="mt-3 p-3">
            <h5>⭐ {review.rating}/5</h5>

            <p>{review.comment}</p>

            <small>
              By: <strong>{review.customer_name}</strong>
            </small>
            <div className="mt-2">
  <Button
  variant="warning"
  size="sm"
  onClick={() => {
    console.log("Edit Button Clicked", review.id);

    setIsEditing(true);
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    window.scrollTo({
  top: 0,
  behavior: "smooth",
});
  }}
>
  Edit
</Button>

  <Button
    variant="danger"
    size="sm"
    className="ms-2"
    onClick={() => deleteReview(review.id)}
  >
    Delete
  </Button>
</div>

          </Card>
        ))
      )}

    </Card>
  </Container>
);

}

export default WorkerProfile;