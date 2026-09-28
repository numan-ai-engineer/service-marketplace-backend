import { useEffect, useRef, useState } from "react";
import { Container, Card, Badge, Button } from "react-bootstrap";
import api from "../utils/api";
import GoogleMapComponent from "../components/GoogleMap";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [customerLocation, setCustomerLocation] = useState(null);

  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // =========================
  // BOOKING STATUS NOTIFICATION
  // =========================

  const [bookingNotification, setBookingNotification] = useState(null);

  const previousBookingsRef = useRef([]);

  // =========================
  // LOAD DASHBOARD
  // =========================

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("access");

      const response = await api.get(
        "/customer/dashboard/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      console.log(
  "CUSTOMER DASHBOARD FULL:",
  JSON.stringify(response.data, null, 2)
);

console.log(
  "BOOKINGS FULL:",
  JSON.stringify(response.data?.bookings, null, 2)
);

      // =========================
// DETECT BOOKING STATUS CHANGES
// =========================

const bookings = response.data?.bookings || [];

const previousBookings =
  previousBookingsRef.current;

console.log(
  "📊 CURRENT BOOKINGS:",
  bookings.length
);

console.log(
  "📊 PREVIOUS BOOKINGS:",
  previousBookings.length
);

bookings.forEach((booking) => {
  const previousBooking =
    previousBookings.find(
      (item) => item.id === booking.id
    );

  const previousStatus =
    previousBooking?.status;

  const currentStatus =
    booking.status;

  console.log(
    "🔎 BOOKING STATUS CHECK:",
    {
      bookingId: booking.id,
      previousStatus,
      currentStatus,
    }
  );

  if (
    previousStatus &&
    previousStatus !== currentStatus
  ) {
    console.log(
      "🔔 BOOKING STATUS CHANGED:",
      booking.id,
      previousStatus,
      "→",
      currentStatus
    );

    let message = "";

    if (currentStatus === "accepted") {
      message =
        "Worker accepted your booking request.";
    }

    if (currentStatus === "rejected") {
      message =
        "Worker rejected your booking request.";
    }

    if (currentStatus === "completed") {
      message =
        "Your booking has been completed.";
    }

    if (currentStatus === "cancelled") {
      message =
        "Your booking has been cancelled.";
    }

    if (message) {
      setBookingNotification({
        booking,
        message,
        status: currentStatus,
      });
    }
  }
});

// Save current bookings for next polling cycle
previousBookingsRef.current = bookings;

      setDashboard(response.data);

      // =========================
      // NEARBY WORKERS
      // =========================

      const workersResponse = await api.get(
        "/customer/nearby-workers/?radius=50",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      console.log(
        "NEARBY WORKERS:",
        workersResponse.data
      );

      setWorkers(
        workersResponse.data.workers || []
      );
    } catch (error) {
      console.log(
        "LOAD DASHBOARD ERROR:",
        error.response?.data || error
      );
    }
  };

  // =========================
  // LOAD DASHBOARD EVERY 5 SECONDS
  // =========================

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================
  // CUSTOMER GPS LOCATION
  // =========================

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          const latitude = Number(
            position.coords.latitude.toFixed(6)
          );

          const longitude = Number(
            position.coords.longitude.toFixed(6)
          );

          const accuracy = Number(
            position.coords.accuracy.toFixed(2)
          );

          console.log(
            "CUSTOMER GPS:",
            latitude,
            longitude
          );

          setCustomerLocation({
            latitude,
            longitude,
          });

          try {
            const token =
              localStorage.getItem("access");

            await api.post(
              "/customer/location/",
              {
                latitude,
                longitude,
                accuracy,
              },
              {
                headers: {
                  Authorization:
                    "Bearer " + token,
                },
              }
            );

            console.log(
              "CUSTOMER LOCATION REQUEST COMPLETED"
            );
          } catch (error) {
            console.log(
              "CUSTOMER LOCATION ERROR STATUS:",
              error.response?.status
            );

            console.log(
              "CUSTOMER LOCATION ERROR DATA:",
              error.response?.data
            );

            console.log(
              "CUSTOMER LOCATION ERROR:",
              error
            );
          }
        },

        (error) => {
          console.log(
            "CUSTOMER GPS ERROR CODE:",
            error.code
          );

          console.log(
            "CUSTOMER GPS ERROR MESSAGE:",
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
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, []);

  // =========================
  // BOOK WORKER
  // =========================

  const bookWorker = async (worker) => {
    const token =
      localStorage.getItem("access");

    console.log(
      "FULL WORKER OBJECT:",
      worker
    );

    console.log(
      "WORKER SERVICES:",
      worker.services
    );

    if (
      !worker.services ||
      worker.services.length === 0
    ) {
      alert(
        "This worker has no service available."
      );
      return;
    }

    const serviceNames =
      worker.services
        .map(
          (service, index) =>
            `${index + 1}. ${service.name}`
        )
        .join("\n");

    const selectedNumber =
      window.prompt(
        `Select a service:\n\n${serviceNames}\n\nEnter service number:`
      );

    if (selectedNumber === null) {
      return;
    }

    const serviceIndex =
      Number(selectedNumber) - 1;

    if (
      serviceIndex < 0 ||
      serviceIndex >= worker.services.length
    ) {
      alert(
        "Invalid service selection."
      );
      return;
    }

    const service =
      worker.services[serviceIndex];

    console.log(
      "SELECTED SERVICE OBJECT:",
      service
    );

    console.log(
      "BOOKING WORKER ID:",
      worker.id
    );

    console.log(
      "BOOKING SERVICE ID:",
      service.id
    );

    try {
      const response = await api.post(
        "/bookings/",
        {
          worker: worker.id,
          service: service.id,
        },
        {
          headers: {
            Authorization:
              "Bearer " + token,
          },
        }
      );

      console.log(
        "BOOKING RESPONSE:",
        response
      );

      if (
        response.status >= 200 &&
        response.status < 300
      ) {
        alert(
          `Booking created successfully for ${service.name}!`
        );

        loadDashboard();
      } else {
        alert(
          response.data?.error ||
            response.data?.detail ||
            "Booking Failed!"
        );
      }
    } catch (error) {
      console.log(
        "BOOKING ERROR:",
        error
      );

      alert(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Booking Failed!"
      );
    }
  };

  // =========================
  // CANCEL BOOKING
  // =========================

  const cancelBooking = async (bookingId) => {
    const token =
      localStorage.getItem("access");

    try {
      const response = await api.patch(
        `/bookings/${bookingId}/status/`,
        {
          status: "cancelled",
        },
        {
          headers: {
            Authorization:
              "Bearer " + token,
          },
        }
      );

      console.log(response);

      if (
        response.status >= 200 &&
        response.status < 300
      ) {
        alert(
          "Booking Cancelled Successfully!"
        );

        loadDashboard();
      }
    } catch (error) {
      console.log(
        "CANCEL BOOKING ERROR:",
        error
      );

      alert(
        error.response?.data?.error ||
          "Booking cancellation failed."
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (!dashboard) {
    return (
      <h2 className="text-center mt-5">
        Loading...
      </h2>
    );
  }

  // =========================
  // BADGE COLOR
  // =========================

  const getBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";

      case "accepted":
        return "success";

      case "completed":
        return "primary";

      case "rejected":
        return "danger";

      case "cancelled":
        return "dark";

      default:
        return "secondary";
    }
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <>
      {/* =========================
          BOOKING STATUS NOTIFICATION
      ========================= */}

      {bookingNotification && (
        <div
          className={`position-fixed top-0 end-0 m-4 p-4 rounded-4 shadow-lg text-white ${
            bookingNotification.status ===
            "accepted"
              ? "bg-success"
              : bookingNotification.status ===
                "rejected"
              ? "bg-danger"
              : bookingNotification.status ===
                "completed"
              ? "bg-primary"
              : "bg-dark"
          }`}
          style={{
            zIndex: 9999,
            minWidth: "320px",
            maxWidth: "420px",
          }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="fw-bold mb-2">
                🔔 Booking Update
              </h5>

              <p className="mb-2">
                {bookingNotification.message}
              </p>

              <small>
                Booking #
                {bookingNotification.booking?.id}
              </small>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white ms-3"
              aria-label="Close"
              onClick={() =>
                setBookingNotification(null)
              }
            />
          </div>
        </div>
      )}

      <Container className="mt-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold">
            👋 Welcome Back
          </h1>

          <h3 className="text-primary">
            {dashboard.customer}
          </h3>

          <p className="text-muted">
            Manage all your bookings from one
            place.
          </p>
        </div>

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <Card className="shadow border-0 text-center p-3">
              <h5>📅 Total Bookings</h5>

              <h2 className="text-primary">
                {dashboard.total_bookings}
              </h2>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="shadow border-0 text-center p-3">
              <h5>🟡 Pending</h5>

              <h2 className="text-warning">
                {dashboard.pending}
              </h2>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="shadow border-0 text-center p-3">
              <h5>🟢 Accepted</h5>

              <h2 className="text-success">
                {dashboard.accepted}
              </h2>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="shadow border-0 text-center p-3">
              <h5>🔵 Completed</h5>

              <h2 className="text-info">
                {dashboard.completed}
              </h2>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="shadow border-0 text-center p-3">
              <h5>🔴 Cancelled</h5>

              <h2 className="text-danger">
                {dashboard.cancelled}
              </h2>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="shadow border-0 text-center p-3">
              <h5>⚫ Rejected</h5>

              <h2 className="text-dark">
                {dashboard.rejected}
              </h2>
            </Card>
          </div>
        </div>

        {/* =========================
            NEARBY WORKERS
        ========================= */}

        <div className="mb-5">
          <h2 className="fw-bold mb-4">
            📍 Nearby Online Workers
          </h2>

          <GoogleMapComponent
            workers={workers}
            customerLocation={
              customerLocation
            }
            showBookingButton={true}
            onBookWorker={bookWorker}
          />
        </div>

        <hr className="mb-4" />

        {/* =========================
            MY BOOKINGS
        ========================= */}

        <h2 className="fw-bold mb-4">
          📋 My Bookings
        </h2>

        {dashboard.bookings.map(
          (booking) => (
            <Card
              key={booking.id}
              className="shadow-lg border-0 rounded-4 p-4 mb-4"
              style={{
                transition: "0.3s",
                cursor: "pointer",
              }}
            >
              <h4 className="fw-bold text-primary mb-3">
                🔧 {booking.service.name}
              </h4>

              <p className="mb-2">
                <strong>
                  👷 Worker:
                </strong>{" "}
                {booking.worker.name}
              </p>

              <p className="mb-2">
                <strong>
                  📅 Date:
                </strong>{" "}
                {new Date(
                  booking.booking_date
                ).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>

              <p className="mb-3">
                <strong>
                  📌 Status:
                </strong>{" "}

                <Badge
                  bg={getBadgeColor(
                    booking.status
                  )}
                >
                  {booking.status}
                </Badge>
              </p>

              {booking.status === "pending" && (
  <>
    <Button
      variant="danger"
      onClick={() => cancelBooking(booking.id)}
    >
      Cancel Booking
    </Button>

    <Button
      variant="primary"
      className="ms-2"
      onClick={() => navigate(`/booking/${booking.id}`)}
    >
      View Details
    </Button>
  </>
)}

              {booking.status ===
                "completed" && (
                <Button
                  variant="warning"
                  className="ms-2"
                  onClick={() => {
                    setReviewBooking(
                      booking
                    );

                    setShowReviewForm(
                      true
                    );
                  }}
                >
                  ⭐ Give Review
                </Button>
              )}

              {reviewBooking?.id ===
                booking.id && (
                <div className="mt-4 p-4 bg-light rounded-4 border">
                  <h5 className="fw-bold mb-3">
                    ⭐ Review{" "}
                    {booking.worker.name}
                  </h5>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Rating
                    </label>

                    <select
                      className="form-select"
                      value={reviewRating}
                      onChange={(e) =>
                        setReviewRating(
                          Number(
                            e.target.value
                          )
                        )
                      }
                    >
                      <option value={5}>
                        ⭐⭐⭐⭐⭐ 5 -
                        Excellent
                      </option>

                      <option value={4}>
                        ⭐⭐⭐⭐ 4 -
                        Very Good
                      </option>

                      <option value={3}>
                        ⭐⭐⭐ 3 - Good
                      </option>

                      <option value={2}>
                        ⭐⭐ 2 - Average
                      </option>

                      <option value={1}>
                        ⭐ 1 - Poor
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Comment
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      value={
                        reviewComment
                      }
                      onChange={(e) =>
                        setReviewComment(
                          e.target.value
                        )
                      }
                      placeholder="Write your experience..."
                    />
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      setReviewBooking(
                        null
                      )
                    }
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          )
        )}

        {/* =========================
            REVIEW FORM
        ========================= */}

        {showReviewForm &&
          reviewBooking && (
            <Card className="shadow-lg border-0 rounded-4 p-4 mb-5">
              <h3 className="fw-bold text-warning mb-4">
                ⭐ Write a Review
              </h3>

              <p className="mb-3">
                <strong>
                  Booking:
                </strong>{" "}
                #{reviewBooking.id}
              </p>

              <p className="mb-4">
                <strong>
                  Worker:
                </strong>{" "}
                {
                  reviewBooking
                    .worker.name
                }
              </p>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  Rating
                </label>

                <select
                  className="form-select"
                  value={reviewRating}
                  onChange={(e) =>
                    setReviewRating(
                      Number(
                        e.target.value
                      )
                    )
                  }
                >
                  <option value={5}>
                    ⭐⭐⭐⭐⭐ 5 -
                    Excellent
                  </option>

                  <option value={4}>
                    ⭐⭐⭐⭐ 4 -
                    Very Good
                  </option>

                  <option value={3}>
                    ⭐⭐⭐ 3 - Good
                  </option>

                  <option value={2}>
                    ⭐⭐ 2 - Average
                  </option>

                  <option value={1}>
                    ⭐ 1 - Poor
                  </option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  Comment
                </label>

                <textarea
                  className="form-control"
                  rows="5"
                  value={
                    reviewComment
                  }
                  onChange={(e) =>
                    setReviewComment(
                      e.target.value
                    )
                  }
                  placeholder="Write your experience with this worker..."
                />
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowReviewForm(
                      false
                    );

                    setReviewBooking(
                      null
                    );
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="warning"
                  onClick={() =>
                    alert(
                      "Submit Review - Next Step"
                    )
                  }
                >
                  ⭐ Submit Review
                </Button>
              </div>
            </Card>
          )}
      </Container>
    </>
  );
}

export default CustomerDashboard;