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
const loadServices = async () => {
  const response = await api.get("/services/");

  console.log(response);
  if (response.ok) {
    setServices(response.data);
  }
};

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

useEffect(() => {
  loadServices();
  loadWorkers();
}, []);

return (
    <>
      {/* HERO SECTION */}

<section
  className="position-relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg,#0f172a,#1d4ed8,#312e81)",
    minHeight: "90vh",
  }}
>
  <Container>

    <Row className="align-items-center py-5">

      <Col lg={6}>

        <Badge
          bg="light"
          text="primary"
          className="mb-4 px-3 py-2"
        >
          🇵🇰 Pakistan's Smart Service Marketplace
        </Badge>

        <h1
          className="fw-bold text-white"
          style={{
            fontSize: "60px",
            lineHeight: "1.2",
          }}
        >
          Find Trusted
          <br />
          Workers Near You
        </h1>

        <p
          className="text-white-50 mt-4"
          style={{
            fontSize: "20px",
          }}
        >
          Electrician, AC Repair,
          Plumber, Solar Installer,
          Driver, Painter and hundreds
          of verified professionals.
        </p>

        <div className="mt-5 d-flex gap-3">

          <Button
            size="lg"
            variant="light"
            onClick={() => navigate("/services")}
          >
            Find Services
          </Button>

          <Button
            size="lg"
            variant="outline-light"
            onClick={() => navigate("/register")}
          >
            Become Worker
          </Button>

        </div>

      </Col>

      <Col
        lg={6}
        className="text-center"
      >

        <img
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=700"
          alt="worker"
          className="img-fluid rounded-5 shadow-lg"
        />

      </Col>

    </Row>

  </Container>
</section>

      {/* Popular Services */}
      <Container className="my-5">

        <h2 className="text-center fw-bold mb-5">
          Popular Services
        </h2>

        <Row className="g-4">
  {services.map((service) => (
    <Col lg={3} md={6} key={service.id}>
     <Card
  className="border-0 shadow-lg rounded-4 h-100 overflow-hidden"
  style={{
    transition: "all 0.35s ease",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-10px)";
    e.currentTarget.style.boxShadow =
      "0 20px 50px rgba(37,99,235,.25)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "0 10px 25px rgba(0,0,0,.15)";
  }}
>
        <Card.Body className="text-center p-4">

          <div
            className="mx-auto mb-4"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            🛠️
          </div>

          <h4 className="fw-bold">
            {service.name}
          </h4>

          <p className="text-muted">
            {service.description}
          </p>

          <Button
            className="rounded-pill mt-3"
            onClick={() => navigate(`/services/${service.id}`)}
          >
            View Service
          </Button>

        </Card.Body>
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
   <Card
  className="border-0 shadow-lg rounded-4 h-100 overflow-hidden"
  style={{
    transition: "all 0.35s ease",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-10px)";
    e.currentTarget.style.boxShadow =
      "0 20px 50px rgba(37,99,235,.25)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "0 10px 25px rgba(0,0,0,.15)";
  }}
>
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

    <h4 className="fw-bold">
      {worker.user.name}
    </h4>

    <p className="text-muted">
      📍 {worker.city}
    </p>

    <Badge bg="success" className="mb-2">
      ⭐ {worker.rating}
    </Badge>

    <p className="text-muted">
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
      className="rounded-pill"
      onClick={() => navigate(`/worker/${worker.id}`)}
    >
      View Profile
    </Button>

  </Card.Body>
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