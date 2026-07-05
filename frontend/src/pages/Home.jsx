import { useEffect, useState } from "react";
import { Button, Container, Row, Col, Card, Badge, } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState("");
  const [sortBy, setSortBy] = useState("");
  useEffect(() => {
  loadServices();
const loadWorkers = async () => {
  const response = await api.get("/workers/");

  if (response.ok) {
    console.log("Workers Data:");
    console.log(response.data);

    response.data.forEach((worker) => {
      console.log(worker);
    });

    setWorkers(response.data);
  }
};
  loadWorkers();
}, []);

const loadServices = async () => {
  const response = await api.get("/services/");

  console.log(response);

  if (response.ok) {
    setServices(response.data);
  }
};

  return (
    <>
      {/* Hero Section */}
      <div
        className="py-5 text-white"
        style={{
          background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
        }}
      >
        <Container className="text-center">
          <h1 className="display-3 fw-bold">
            Service Marketplace
          </h1>

          <p className="lead mt-4">
            Find Trusted Workers Near You
          </p>

          <p className="mb-4">
            Book Electricians, Plumbers, Drivers, Painters
            and many more professional services.
          </p>

          <Button
            variant="light"
            size="lg"
            onClick={() => navigate("/services")}
          >
            Find Services
          </Button>
        </Container>
      </div>

      {/* Popular Services */}
      <Container className="my-5">

        <h2 className="text-center fw-bold mb-5">
          Popular Services
        </h2>

        <Row>
  {services.map((service) => (
    <Col md={3} className="mb-4" key={service.id}>
      <Card className="shadow h-100 text-center p-3">

        <h1>🛠️</h1>

        <h4>{service.name}</h4>

        <p>{service.description}</p>

        <Button
          variant="primary"
          onClick={() => navigate(`/services/${service.id}`)}
        >
          View Details
        </Button>

      </Card>
    </Col>
  ))}
</Row>

      </Container>

      {/* Why Choose Us */}
      <Container className="mb-5">

        <h2 className="text-center fw-bold mb-5">
          Why Choose Us?
        </h2>

        <Row>

          <Col md={4} className="text-center mb-4">
            <h1>⭐</h1>
            <h4>Verified Workers</h4>
            <p>Only trusted professionals.</p>
          </Col>

          <Col md={4} className="text-center mb-4">
            <h1>⚡</h1>
            <h4>Fast Booking</h4>
            <p>Book workers in seconds.</p>
          </Col>

          <Col md={4} className="text-center mb-4">
            <h1>💰</h1>
            <h4>Affordable Prices</h4>
            <p>Quality services at fair prices.</p>
          </Col>

        </Row>

      </Container>
      {/* Statistics */}

<Container className="mb-5">

  <Row className="text-center">

    <Col md={3} className="mb-4">
      <h1 className="text-primary fw-bold">
        1000+
      </h1>

      <h5>Workers</h5>
    </Col>

    <Col md={3} className="mb-4">
      <h1 className="text-success fw-bold">
        5000+
      </h1>

      <h5>Customers</h5>
    </Col>

    <Col md={3} className="mb-4">
      <h1 className="text-warning fw-bold">
        10000+
      </h1>

      <h5>Bookings</h5>
    </Col>

    <Col md={3} className="mb-4">
      <h1 className="text-danger fw-bold">
        4.9★
      </h1>

      <h5>Average Rating</h5>
    </Col>

  </Row>

</Container>
{/* Featured Workers */}

<Container className="mb-5">

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
    id="availableOnly"
    checked={availableOnly}
    onChange={(e) => setAvailableOnly(e.target.checked)}
  />

  <label
    className="form-check-label"
    htmlFor="availableOnly"
  >
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
        <Card className="shadow h-100 text-center p-3">
          <h1>👷</h1>

          <h4>{worker.user.name}</h4>

          <p>📍 {worker.city}</p>

          <p>⭐ {worker.rating}</p>

          <p>Experience: {worker.experience_years} Years</p>

          <p>Services:</p>

          {worker.services.map((service, index) => (
            <Badge
              bg="primary"
              className="me-2"
              key={index}
            >
              {service}
            </Badge>
          ))}

          <Button
            variant="outline-primary"
            className="mt-3"
            onClick={() => navigate(`/worker/${worker.id}`)}
          >
            View Profile
          </Button>
        </Card>
      </Col>
    ))}
</Row>

</Container>

{/* Footer */}

<footer
  style={{
    backgroundColor: "#212529",
    color: "white",
    padding: "40px 0",
    marginTop: "50px",
  }}
>
  <Container>

    <Row>

      <Col md={4}>
        <h4>Service Marketplace</h4>
        <p>
          Find trusted workers for your daily needs.
        </p>
      </Col>

      <Col md={4}>
        <h4>Quick Links</h4>

        <p>Home</p>
        <p>Services</p>
        <p>Profile</p>
      </Col>

      <Col md={4}>
        <h4>Contact</h4>

        <p>📧 support@servicemarketplace.com</p>

        <p>📞 +92 300 1234567</p>

        <p>📍 Lahore, Pakistan</p>
      </Col>

    </Row>

    <hr style={{ borderColor: "#555" }} />

    <p className="text-center mb-0">
      © 2026 Service Marketplace. All Rights Reserved.
    </p>

  </Container>
</footer>
    </>
  );
}

export default Home;