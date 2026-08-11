import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
} from "react-bootstrap";

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
  const filteredWorkers = workers
    .filter((worker) => {
      const search = workerSearch.toLowerCase();

      const workerName =
        worker.user?.name?.toLowerCase() || "";

      const city =
        worker.city?.toLowerCase() || "";

      const services =
        worker.services || [];

      const matchesSearch =
        workerName.includes(search) ||
        city.includes(search) ||
        services.some((service) =>
          service.toLowerCase().includes(search)
        );

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

  return (
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
                      .map((worker) => worker.city)
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
                  setMinimumRating(e.target.value)
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
                      📍 {worker.city ||
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
                    {worker.experience_years || 0} Years
                  </div>

                </div>

                {/* SERVICES */}

<div className="mb-4">

  <span className="text-muted small d-block mb-2">
    Services
  </span>

{(worker.services || []).map((service, index) => (
<Badge
bg="light"
text="primary"
className="border me-2 mb-2 px-3 py-2"
key={service?.id ?? index}
>
{typeof service === "object"
? service?.name
: service} </Badge>
))}

</div>

                {/* BUTTON */}
                <Button
                  variant="primary"
                  className="rounded-pill w-100 py-2 fw-semibold"
                  onClick={() =>
                    navigate(
                      `/worker/${worker.id}`
                    )
                  }
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
  );
}

export default FeaturedWorkers;