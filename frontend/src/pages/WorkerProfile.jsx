import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import api from "../utils/api";

function WorkerProfile() {
  const { id } = useParams();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [bookingId, setBookingId] = useState("");
  const [myReview, setMyReview] = useState(null);

  const [editingReviewId, setEditingReviewId] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const isAdmin = user?.role === "admin";

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
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/workers/${id}/`
      );

      console.log("Worker:", response);

      if (response.ok) {
        setWorker(response.data);
      } else {
        setError("Unable to load worker profile.");
      }
    } catch (error) {
      console.log("Worker Error:", error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await api.get("/reviews/");

      console.log("Reviews:", response);

      if (response.ok) {
        const workerReviews =
          response.data.filter(
            (review) => review.worker == id
          );

        setReviews(workerReviews);
      }
    } catch (error) {
      console.log("Reviews Error:", error);
    }
  };

  const loadBooking = async () => {
  if (!worker) return;

  try {
    const response = await api.get("/bookings/");

    console.log("Bookings:", response);

    if (response.ok) {
      const currentUser = JSON.parse(
        localStorage.getItem("user")
      );

      const booking = response.data.find(
        (b) =>
          b.worker?.id === worker.user.id &&
          b.customer?.id === currentUser?.id &&
          b.status === "completed"
      );

      if (booking) {
        setBookingId(booking.id);

        console.log(
          "My Completed Booking ID:",
          booking.id
        );
      } else {
        setBookingId("");

        console.log(
          "No completed booking found for this customer."
        );
      }
    }
  } catch (error) {
    console.log("Booking Error:", error);
  }
};

  const submitReview = async (e) => {
    e.preventDefault();

    console.log("Booking ID:", bookingId);
    console.log("Rating:", rating);
    console.log("Comment:", comment);

    if (!bookingId) {
      alert("No completed booking found.");
      return;
    }

    let response;

    try {
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
        alert(
          JSON.stringify(response.data)
        );
      }
    } catch (error) {
      console.log(
        "Review Submit Error:",
        error
      );

      alert("Something went wrong.");
    }
  };

  const deleteReview = async (reviewId) => {
    console.log(
      "Deleting Review ID:",
      reviewId
    );

    try {
      const token =
        localStorage.getItem("access");

      const response =
        await api.delete(
          `/reviews/${reviewId}/`,
          {
            headers: {
              Authorization:
                "Bearer " + token,
            },
          }
        );

      console.log(response);

      if (response.ok) {
        alert(
          "Review Deleted Successfully!"
        );

        loadReviews();
      } else {
        alert(
          JSON.stringify(response.data)
        );
      }
    } catch (error) {
      console.log(
        "Delete Review Error:",
        error
      );
    }
  };

  /* LOADING */

  if (loading) {
    return (
      <Container className="py-5 text-center">

        <Spinner
          animation="border"
          variant="primary"
        />

        <p className="text-muted mt-3">
          Loading worker profile...
        </p>

      </Container>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <Container className="py-5">

        <Alert variant="danger">
          {error}
        </Alert>

      </Container>
    );
  }

  if (!worker) {
    return (
      <Container className="py-5 text-center">

        <div style={{ fontSize: "60px" }}>
          👷
        </div>

        <h3 className="fw-bold mt-3">
          Worker Not Found
        </h3>

      </Container>
    );
  }

  return (
    <>
      {/* PROFILE HERO */}

      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg,#0f172a,#1d4ed8,#312e81)",
        }}
      >
        <Container className="py-4">

          <Row className="align-items-center">

            <Col
              lg={4}
              className="text-center mb-4 mb-lg-0"
            >

              <img
                src="https://i.pravatar.cc/300?img=12"
                alt="worker"
                className="rounded-circle shadow-lg"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  border: "5px solid white",
                }}
              />

            </Col>

            <Col lg={8}>

              <Badge
                bg={
                  worker.is_available
                    ? "success"
                    : "danger"
                }
                className="rounded-pill px-3 py-2 mb-3"
              >
                {worker.is_available
                  ? "✓ Available"
                  : "Not Available"}
              </Badge>

              <h1 className="display-5 fw-bold text-white">
                {worker.user.name}
              </h1>

              <p className="text-white-50 fs-5">
                📍 {worker.city}
              </p>

              <div className="d-flex flex-wrap gap-3 mt-3">

                <Badge
                  bg="warning"
                  text="dark"
                  className="px-3 py-2"
                >
                  ⭐ {worker.rating}
                </Badge>

                <Badge
                  bg="light"
                  text="dark"
                  className="px-3 py-2"
                >
                  💼 {worker.experience_years} Years
                </Badge>

              </div>

            </Col>

          </Row>

        </Container>
      </section>

      {/* MAIN CONTENT */}

      <Container className="py-5">

        <Row className="g-4">

          {/* WORKER INFORMATION */}

          <Col lg={8}>

            <Card className="border-0 shadow-sm rounded-4">

              <Card.Body className="p-4 p-lg-5">

                <h3 className="fw-bold mb-4">
                  Worker Information
                </h3>

                <Row className="g-4">

                  <Col md={6}>

                    <div className="p-3 bg-light rounded-4">

                      <small className="text-muted">
                        Phone
                      </small>

                      <h5 className="fw-bold mt-2 mb-0">
                        📞 {worker.user.phone}
                      </h5>

                    </div>

                  </Col>

                  <Col md={6}>

                    <div className="p-3 bg-light rounded-4">

                      <small className="text-muted">
                        Location
                      </small>

                      <h5 className="fw-bold mt-2 mb-0">
                        📍 {worker.city}
                      </h5>

                    </div>

                  </Col>

                </Row>

                <hr className="my-4" />

                <h4 className="fw-bold mb-3">
                  Services Offered
                </h4>

                <div>

                  {worker.services.map((service, index) => (
  <Badge
    bg="primary"
    className="me-2 mb-2 px-3 py-2"
    key={service.id ?? index}
  >
    {typeof service === "object" ? service.name : service}
  </Badge>
))}

                </div>

              </Card.Body>

            </Card>

            {/* REVIEWS */}

            <Card
              className="border-0 shadow-sm rounded-4 mt-4"
            >

              <Card.Body className="p-4">

                <h3 className="fw-bold mb-4">
                  Customer Reviews
                </h3>

                {reviews.length === 0 ? (

                  <div className="text-center py-4">

                    <div
                      style={{
                        fontSize: "45px",
                      }}
                    >
                      ⭐
                    </div>

                    <p className="text-muted mt-2">
                      No reviews yet.
                    </p>

                  </div>

                ) : (

                  reviews.map((review) => (

                    <Card
                      key={review.id}
                      className="border-0 bg-light rounded-4 mb-3"
                    >

                      <Card.Body>

                        <div className="d-flex justify-content-between">

                          <h5 className="fw-bold">
                            ⭐ {review.rating}/5
                          </h5>

                        </div>

                        <p className="mt-3 mb-2">
                          {review.comment}
                        </p>

                        <small className="text-muted">
                          By:{" "}
                          <strong>
                            {review.customer_name}
                          </strong>
                        </small>

                        {!isAdmin && (

                          <div className="mt-3">

                            <Button
                              variant="warning"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => {

                                setIsEditing(true);

                                setEditingReviewId(
                                  review.id
                                );

                                setRating(
                                  review.rating
                                );

                                setComment(
                                  review.comment
                                );

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
                              className="rounded-pill ms-2"
                              onClick={() =>
                                deleteReview(
                                  review.id
                                )
                              }
                            >
                              Delete
                            </Button>

                          </div>

                        )}

                      </Card.Body>

                    </Card>

                  ))

                )}

              </Card.Body>

            </Card>

          </Col>

          {/* REVIEW FORM */}

          {!isAdmin && (

            <Col lg={4}>

              <Card
                className="border-0 shadow-lg rounded-4 sticky-lg-top"
                style={{
                  top: "90px",
                }}
              >

                <Card.Body className="p-4">

                  <h4 className="fw-bold">
                    {isEditing
                      ? "Edit Your Review"
                      : "Write a Review"}
                  </h4>

                  <p className="text-muted">
                    Share your experience with this worker.
                  </p>

                  <Form
                    className="mt-4"
                    onSubmit={submitReview}
                  >

                    <Form.Group className="mb-3">

                      <Form.Label>
                        Rating
                      </Form.Label>

                      <Form.Select
                        value={rating}
                        onChange={(e) =>
                          setRating(
                            e.target.value
                          )
                        }
                      >
                        <option value="5">
                          ⭐⭐⭐⭐⭐ (5)
                        </option>

                        <option value="4">
                          ⭐⭐⭐⭐ (4)
                        </option>

                        <option value="3">
                          ⭐⭐⭐ (3)
                        </option>

                        <option value="2">
                          ⭐⭐ (2)
                        </option>

                        <option value="1">
                          ⭐ (1)
                        </option>

                      </Form.Select>

                    </Form.Group>

                    <Form.Group className="mb-3">

                      <Form.Label>
                        Comment
                      </Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={comment}
                        onChange={(e) =>
                          setComment(
                            e.target.value
                          )
                        }
                        placeholder="Write your review..."
                      />

                    </Form.Group>

                    <Button
                      variant={
                        isEditing
                          ? "warning"
                          : "primary"
                      }
                      type="submit"
                      className="w-100 rounded-pill fw-semibold"
                    >
                      {isEditing
                        ? "Update Review"
                        : "Submit Review"}
                    </Button>

                    {isEditing && (

                      <Button
                        variant="outline-secondary"
                        className="w-100 rounded-pill mt-2"
                        onClick={() => {

                          setIsEditing(false);
                          setEditingReviewId(null);
                          setRating(5);
                          setComment("");

                        }}
                      >
                        Cancel Edit
                      </Button>

                    )}

                  </Form>

                </Card.Body>

              </Card>

            </Col>

          )}

        </Row>

      </Container>
    </>
  );
}

export default WorkerProfile;