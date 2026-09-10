import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
} from "react-bootstrap";
import api from "../../utils/api";

function FeaturedWorkers({
  workers,
  workerSearch,
  setWorkerSearch,
  selectedCity,
  setSelectedCity,
  availableOnly,
  setAvailableOnly,
  minimumRating,
  setMinimumRating,
  sortBy,
  setSortBy,
  navigate,
}) {
  const [bookingWorker, setBookingWorker] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const filteredWorkers = workers
    .filter((worker) => {
      const search = workerSearch.toLowerCase();

      const workerName =
        worker.user?.name?.toLowerCase() || "";

      const city =
        worker.city?.toLowerCase() || "";

      const services = worker.services || [];

      const matchesSearch =
        workerName.includes(search) ||
        city.includes(search) ||
        services.some((service) => {
          const serviceName =
            typeof service === "object"
              ? service?.name || ""
              : service || "";

          return serviceName
            .toLowerCase()
            .includes(search);
        });

      const matchesCity =
        selectedCity === "" ||
        worker.city === selectedCity;

      const matchesAvailability =
        !availableOnly ||
        worker.is_available;

      const matchesRating =
        minimumRating === "" ||
        worker.rating >= Number(minimumRating);

      return (
        matchesSearch &&
        matchesCity &&
        matchesAvailability &&
        matchesRating
      );
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      if (sortBy === "experience") {
        return (
          b.experience_years -
          a.experience_years
        );
      }

      return 0;
    });

  const openBookingModal = (worker) => {
    const services = worker.services || [];

    if (services.length === 0) {
      alert(
        "This worker currently has no services available."
      );
      return;
    }

    setBookingWorker(worker);

    setSelectedService(
      services[0]?.id
        ? String(services[0].id)
        : ""
    );
  };

  const closeBookingModal = () => {
    if (bookingLoading) return;

    setBookingWorker(null);
    setSelectedService("");
  };

  const requestWorker = async () => {
    if (!bookingWorker) {
      return;
    }

    if (!selectedService) {
      alert("Please select a service.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await api.post(
        "/bookings/",
        {
          service: Number(selectedService),
          worker: bookingWorker.id,
        }
      );

      console.log(
        "BOOKING REQUEST RESPONSE:",
        response
      );

      if (response.ok) {
        alert(
          `Booking request sent to ${
            bookingWorker.user?.name ||
            "the worker"
          }.`
        );

        setBookingWorker(null);
        setSelectedService("");
      } else {
        alert(
          response.data?.error ||
            response.data?.detail ||
            "Booking request failed."
        );
      }
    } catch (error) {
      console.error(
        "BOOKING REQUEST ERROR:",
        error
      );

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          "Unable to send booking request."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      <Container className="py-5 my-5">

        {/* HEADER */}
        <div className="text-center mb-5">

          <Badge
            bg="primary"
            className="rounded-pill px-3 py-2 mb-3"
          >
            Featured Professionals
          </Badge>

          <h2 className="display-6 fw-bold">
            Meet Our
            <br />
            <span className="text-primary">
              Trusted Workers
            </span>
          </h2>

          <p
            className="text-muted mx-auto mt-3"
            style={{
              maxWidth: "650px",
            }}
          >
            Find experienced professionals based on
            location, availability, rating and expertise.
          </p>

        </div>

        {/* FILTER PANEL */}
        <Card
          className="border-0 shadow-sm rounded-4 mb-5"
        >
          <Card.Body className="p-4">

            <Row className="g-3">

              {/* SEARCH */}
              <Col lg={4} md={6}>

                <label className="form-label fw-semibold">
                  Search
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Worker, service or city..."
                  value={workerSearch}
                  onChange={(e) =>
                    setWorkerSearch(e.target.value)
                  }
                />

              </Col>

              {/* CITY */}
              <Col lg={2} md={6}>

                <label className="form-label fw-semibold">
                  City
                </label>

                <select
                  className="form-select rounded-3"
                  value={selectedCity}
                  onChange={(e) =>
                    setSelectedCity(e.target.value)
                  }
                >
                  <option value="">
                    All Cities
                  </option>

                  {[
                    ...new Set(
                      workers
                        .map(
                          (worker) =>
                            worker.city
                        )
                        .filter(Boolean)
                    ),
                  ].map((city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  ))}
                </select>

              </Col>

              {/* RATING */}
              <Col lg={2} md={6}>

                <label className="form-label fw-semibold">
                  Rating
                </label>

                <select
                  className="form-select rounded-3"
                  value={minimumRating}
                  onChange={(e) =>
                    setMinimumRating(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    All Ratings
                  </option>

                  <option value="4">
                    4★ & Above
                  </option>

                  <option value="3">
                    3★ & Above
                  </option>

                  <option value="2">
                    2★ & Above
                  </option>

                  <option value="1">
                    1★ & Above
                  </option>
                </select>

              </Col>

              {/* SORT */}
              <Col lg={2} md={6}>

                <label className="form-label fw-semibold">
                  Sort By
                </label>

                <select
                  className="form-select rounded-3"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                >
                  <option value="">
                    Recommended
                  </option>

                  <option value="rating">
                    Highest Rating
                  </option>

                  <option value="experience">
                    Most Experienced
                  </option>
                </select>

              </Col>

              {/* AVAILABILITY */}
              <Col
                lg={2}
                md={12}
                className="d-flex align-items-end"
              >

                <div className="form-check mb-2">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="availableOnly"
                    checked={availableOnly}
                    onChange={(e) =>
                      setAvailableOnly(
                        e.target.checked
                      )
                    }
                  />

                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="availableOnly"
                  >
                    Available Only
                  </label>

                </div>

              </Col>

            </Row>

          </Card.Body>
        </Card>

        {/* RESULT COUNT */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <h5 className="fw-bold mb-0">
            Available Professionals
          </h5>

          <Badge
            bg="light"
            text="dark"
            className="border px-3 py-2"
          >
            {filteredWorkers.length} Workers
          </Badge>

        </div>

        {/* WORKER CARDS */}
        <Row className="g-4">

          {filteredWorkers.map((worker) => (

            <Col
              lg={4}
              md={6}
              key={worker.id}
            >

              <Card
                className="border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                style={{
                  transition:
                    "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-8px)";

                  e.currentTarget.style.boxShadow =
                    "0 20px 45px rgba(15,23,42,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";

                  e.currentTarget.style.boxShadow =
                    "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
              >

                <Card.Body className="p-4">

                  {/* TOP */}
                  <div className="d-flex align-items-center mb-4">

                    <img
                      src="https://i.pravatar.cc/200?img=12"
                      alt="Professional worker"
                      className="rounded-circle"
                      style={{
                        width: "75px",
                        height: "75px",
                        objectFit: "cover",
                      }}
                    />

                    <div className="ms-3">

                      <h5 className="fw-bold mb-1">
                        {worker.user?.name ||
                          "Professional Worker"}
                      </h5>

                      <p className="text-muted small mb-0">
                        📍{" "}
                        {worker.city ||
                          "Location unavailable"}
                      </p>

                    </div>

                  </div>

                  {/* RATING + AVAILABILITY */}
                  <div className="d-flex gap-2 flex-wrap mb-3">

                    <Badge
                      bg="warning"
                      text="dark"
                      className="px-3 py-2"
                    >
                      ⭐ {worker.rating || "N/A"}
                    </Badge>

                    {worker.is_available && (
                      <Badge
                        bg="success"
                        className="px-3 py-2"
                      >
                        ● Available
                      </Badge>
                    )}

                  </div>

                  {/* EXPERIENCE */}
                  <div className="mb-3">

                    <span className="text-muted small">
                      Experience
                    </span>

                    <div className="fw-semibold">
                      {worker.experience_years ||
                        0}{" "}
                      Years
                    </div>

                  </div>

                  {/* SERVICES */}
                  <div className="mb-4">

                    <span className="text-muted small d-block mb-2">
                      Services
                    </span>

                    {(worker.services || []).map(
                      (service, index) => (
                        <Badge
                          bg="light"
                          text="primary"
                          className="border me-2 mb-2 px-3 py-2"
                          key={
                            service?.id ??
                            index
                          }
                        >
                          {typeof service ===
                          "object"
                            ? service?.name
                            : service}
                        </Badge>
                      )
                    )}

                  </div>

                  {/* REQUEST WORKER */}
                  <Button
                    variant="primary"
                    className="rounded-pill w-100 py-2 fw-semibold mb-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingModal(worker);
                    }}
                  >
                    🚀 Request Worker
                  </Button>

                  {/* PROFILE */}
                  <Button
                    variant="outline-primary"
                    className="rounded-pill w-100 py-2 fw-semibold"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/worker/${worker.id}`
                      );
                    }}
                  >
                    View Professional Profile →
                  </Button>

                </Card.Body>

              </Card>

            </Col>

          ))}

        </Row>

        {/* EMPTY STATE */}
        {filteredWorkers.length === 0 && (

          <Card className="border-0 shadow-sm rounded-4 text-center py-5">

            <Card.Body>

              <div
                style={{
                  fontSize: "50px",
                }}
              >
                🔍
              </div>

              <h4 className="fw-bold mt-3">
                No Workers Found
              </h4>

              <p className="text-muted">
                Try changing your search or filter options.
              </p>

            </Card.Body>

          </Card>

        )}

      </Container>

      {/* BOOKING MODAL */}
      {bookingWorker && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor:
              "rgba(15, 23, 42, 0.65)",
            zIndex: 1055,
            padding: "20px",
          }}
          onClick={closeBookingModal}
        >

          <Card
            className="border-0 shadow-lg rounded-4"
            style={{
              width: "100%",
              maxWidth: "500px",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <Card.Body className="p-4 p-md-5">

              <div className="d-flex justify-content-between align-items-start mb-4">

                <div>

                  <Badge
                    bg="primary"
                    className="rounded-pill px-3 py-2 mb-2"
                  >
                    Booking Request
                  </Badge>

                  <h4 className="fw-bold mb-1">
                    Request{" "}
                    {bookingWorker.user?.name ||
                      "Worker"}
                  </h4>

                  <p className="text-muted mb-0">
                    Select the service you need.
                  </p>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeBookingModal}
                />

              </div>

              <label className="form-label fw-semibold">
                Select Service
              </label>

              <select
                className="form-select rounded-3 mb-4"
                value={selectedService}
                onChange={(e) =>
                  setSelectedService(
                    e.target.value
                  )
                }
                disabled={bookingLoading}
              >

                <option value="">
                  Select a service
                </option>

                {(bookingWorker.services || []).map(
                  (service, index) => (
                    <option
                      key={
                        service?.id ??
                        index
                      }
                      value={service?.id}
                    >
                      {typeof service ===
                      "object"
                        ? service?.name
                        : service}
                    </option>
                  )
                )}

              </select>

              <div className="bg-light rounded-3 p-3 mb-4">

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Worker
                  </span>

                  <strong>
                    {bookingWorker.user?.name ||
                      "Professional Worker"}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Location
                  </span>

                  <strong>
                    {bookingWorker.city ||
                      "Unavailable"}
                  </strong>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">
                    Rating
                  </span>

                  <strong>
                    ⭐{" "}
                    {bookingWorker.rating ||
                      "N/A"}
                  </strong>
                </div>

              </div>

              <Button
                variant="primary"
                className="rounded-pill w-100 py-2 fw-semibold"
                onClick={requestWorker}
                disabled={
                  bookingLoading ||
                  !selectedService
                }
              >
                {bookingLoading
                  ? "Sending Request..."
                  : "🚀 Send Booking Request"}
              </Button>

              <Button
                variant="light"
                className="rounded-pill w-100 py-2 fw-semibold mt-2"
                onClick={closeBookingModal}
                disabled={bookingLoading}
              >
                Cancel
              </Button>

            </Card.Body>

          </Card>

        </div>

      )}
    </>
  );
}

export default FeaturedWorkers;