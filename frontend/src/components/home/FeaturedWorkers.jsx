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
  return (
    <Container className="my-5">

      <h2 className="text-center fw-bold mb-5">
        Featured Workers
      </h2>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Search by Worker, Service or City..."
        value={workerSearch}
        onChange={(e) => setWorkerSearch(e.target.value)}
      />

      <select
        className="form-select mb-4"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
      >
        <option value="">All Cities</option>

        {[...new Set(workers.map((worker) => worker.city))].map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <div className="form-check mb-4">

        <input
          className="form-check-input"
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => setAvailableOnly(e.target.checked)}
        />

        <label className="form-check-label">
          Show Available Workers Only
        </label>

      </div>

      <select
        className="form-select mb-4"
        value={minimumRating}
        onChange={(e) => setMinimumRating(e.target.value)}
      >
        <option value="">All Ratings</option>
        <option value="4">4★ & Above</option>
        <option value="3">3★ & Above</option>
        <option value="2">2★ & Above</option>
        <option value="1">1★ & Above</option>
      </select>

      <select
        className="form-select mb-4"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="">Sort Workers</option>
        <option value="rating">Highest Rating</option>
        <option value="experience">Most Experienced</option>
      </select>

      <Row>
  {workers
    .filter((worker) => {
      const search = workerSearch.toLowerCase();

      const matchesSearch =
        worker.user.name.toLowerCase().includes(search) ||
        worker.city.toLowerCase().includes(search) ||
        worker.services.some((service) =>
          service.toLowerCase().includes(search)
        );

      const matchesCity =
        selectedCity === "" || worker.city === selectedCity;

      const matchesAvailability =
        !availableOnly || worker.is_available;

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
        return b.experience_years - a.experience_years;
      }

      return 0;
    })
    .map((worker) => (
      <Col md={4} className="mb-4" key={worker.id}>
        <Card className="shadow-lg border-0 rounded-4 h-100">

          <Card.Body className="text-center">

            <img
              src="https://i.pravatar.cc/200?img=12"
              alt="worker"
              className="rounded-circle mb-3"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
            />

            <h4>{worker.user.name}</h4>

            <p className="text-muted">
              📍 {worker.city}
            </p>

            <Badge bg="success">
              ⭐ {worker.rating}
            </Badge>

            <p className="mt-3">
              Experience: {worker.experience_years} Years
            </p>

            <div className="mb-3">
              {worker.services.map((service, index) => (
                <Badge
                  bg="primary"
                  className="me-2 mb-2"
                  key={index}
                >
                  {service}
                </Badge>
              ))}
            </div>

            <Button
              onClick={() =>
                navigate(`/worker/${worker.id}`)
              }
            >
              View Profile
            </Button>

          </Card.Body>

        </Card>
      </Col>
    ))}
</Row>

    </Container>
  );
}

export default FeaturedWorkers;