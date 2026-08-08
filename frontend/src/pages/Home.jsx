import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import GoogleMapComponent from "../components/GoogleMap";
import { Input } from "@/components/ui/input";
import Hero from "../components/home/Hero";
import PopularServices from "../components/home/PopularServices";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Statistics from "../components/home/Statistics";
import NearbyWorkers from "../components/home/NearbyWorkers";
import FeaturedWorkers from "../components/home/FeaturedWorkers";
import {
  Button,
  Card,
  Badge,
  Container,
  Row,
  Col,
} from "react-bootstrap";


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

  console.log("API RESPONSE:", response);

  if (response.ok) {
    console.log("Workers:", response.data);

    setWorkers(response.data);
  } else {
    console.log("API FAILED");
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
      "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
    minHeight: "78vh",
    display: "flex",
    alignItems: "center",
  }}
>
  <Container className="py-5">
    <Row className="align-items-center g-5">

      {/* LEFT SIDE */}
      <Col lg={6}>

        <Badge
          bg="light"
          text="primary"
          className="rounded-pill px-3 py-2 mb-4 fw-semibold"
        >
          🇵🇰 Pakistan's Smart Service Marketplace
        </Badge>

        <h1
          className="display-3 fw-bold text-white mb-4"
          style={{
            lineHeight: "1.1",
            letterSpacing: "-1px",
          }}
        >
          Find Trusted
          <br />
          <span style={{ color: "#93c5fd" }}>
            Workers Near You
          </span>
        </h1>

        <p
          className="text-white-50 mb-4"
          style={{
            fontSize: "1.15rem",
            lineHeight: "1.8",
            maxWidth: "600px",
          }}
        >
          Book verified professionals for home, business and
          everyday services. Fast booking, trusted workers and
          transparent service experiences.
        </p>

        {/* CTA BUTTONS */}
        <div className="d-flex flex-wrap gap-3 mb-4">

          <Button
            size="lg"
            variant="light"
            className="rounded-pill px-4 fw-semibold"
            onClick={() => navigate("/services")}
          >
            Find Services →
          </Button>

          <Button
            size="lg"
            variant="outline-light"
            className="rounded-pill px-4 fw-semibold"
            onClick={() => navigate("/register")}
          >
            Become a Worker
          </Button>

        </div>

        {/* TRUST TEXT */}
        <div className="d-flex flex-wrap gap-4 text-white-50 small">

          <span>✓ Verified Workers</span>

          <span>✓ Secure Booking</span>

          <span>✓ Fast Service</span>

        </div>

      </Col>

      {/* RIGHT SIDE */}
      <Col lg={6}>

        <div
          className="position-relative"
          style={{
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >

          <img
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900"
            alt="Professional service worker"
            className="img-fluid rounded-5 shadow-lg"
            style={{
              width: "100%",
              height: "430px",
              objectFit: "cover",
            }}
          />

          {/* FLOATING TRUST CARD */}
          <div
            className="position-absolute bg-white rounded-4 shadow-lg p-3"
            style={{
              left: "-20px",
              bottom: "25px",
              minWidth: "210px",
            }}
          >
            <div className="fw-bold">
              ⭐ 4.9 / 5
            </div>

            <div className="text-muted small">
              Trusted customer rating
            </div>
          </div>

          {/* FLOATING VERIFIED CARD */}
          <div
            className="position-absolute bg-white rounded-4 shadow-lg p-3"
            style={{
              right: "-15px",
              top: "25px",
              minWidth: "190px",
            }}
          >
            <div className="fw-bold text-success">
              ✓ Verified
            </div>

            <div className="text-muted small">
              Professional workers
            </div>
          </div>

        </div>

      </Col>

    </Row>
  </Container>
</section>

    {/* POPULAR SERVICES */}
<Container className="py-5 my-5">

  <div className="text-center mb-5">

    <Badge
      bg="primary"
      className="rounded-pill px-3 py-2 mb-3"
    >
      Popular Services
    </Badge>

    <h2 className="display-6 fw-bold">
      Everything You Need,
      <br />
      <span className="text-primary">
        All in One Place
      </span>
    </h2>

    <p
      className="text-muted mx-auto mt-3"
      style={{ maxWidth: "650px" }}
    >
      Discover trusted professionals for the services
      you need at home, at work, or anywhere nearby.
    </p>

  </div>

  <Row className="g-4">

    {services.slice(0, 8).map((service) => (

      <Col
        lg={3}
        md={6}
        key={service.id}
      >

        <Card
          className="border-0 shadow-sm rounded-4 h-100 overflow-hidden"
          style={{
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}

          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-8px)";

            e.currentTarget.style.boxShadow =
              "0 18px 40px rgba(37,99,235,0.18)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";

            e.currentTarget.style.boxShadow =
              "0 .125rem .25rem rgba(0,0,0,.075)";
          }}

          onClick={() =>
            navigate(`/services/${service.id}`)
          }
        >

          <Card.Body className="p-4">

            {/* SERVICE ICON */}
            <div
              className="d-flex align-items-center justify-content-center mb-4"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg,#dbeafe,#ede9fe)",
                fontSize: "30px",
              }}
            >
              🛠️
            </div>

            {/* SERVICE NAME */}
            <h4 className="fw-bold mb-2">
              {service.name}
            </h4>

            {/* DESCRIPTION */}
            <p
              className="text-muted small mb-4"
              style={{
                minHeight: "48px",
              }}
            >
              {service.description ||
                "Professional service from trusted workers."}
            </p>

            {/* BUTTON */}
            <Button
              variant="outline-primary"
              className="rounded-pill px-3"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/services/${service.id}`);
              }}
            >
              View Service →
            </Button>

          </Card.Body>

        </Card>

      </Col>

    ))}

  </Row>

  {/* VIEW ALL */}
  {services.length > 8 && (
    <div className="text-center mt-5">

      <Button
        variant="primary"
        size="lg"
        className="rounded-pill px-4"
        onClick={() => navigate("/services")}
      >
        View All Services →
      </Button>

    </div>
  )}

</Container>

      {/* WHY CHOOSE US */}
<Container className="py-5 my-5">

  <div className="text-center mb-5">

    <Badge
      bg="primary"
      className="rounded-pill px-3 py-2 mb-3"
    >
      Why Choose Us
    </Badge>

    <h2 className="display-6 fw-bold">
      A Better Way to
      <br />
      <span className="text-primary">
        Find Professional Services
      </span>
    </h2>

    <p
      className="text-muted mx-auto mt-3"
      style={{ maxWidth: "650px" }}
    >
      We make finding and booking trusted professionals
      simple, fast and reliable.
    </p>

  </div>

  <Row className="g-4">

    {/* VERIFIED WORKERS */}
    <Col lg={4} md={6}>

      <Card
        className="border-0 shadow-sm rounded-4 h-100"
      >

        <Card.Body className="p-4 p-lg-5">

          <div
            className="d-flex align-items-center justify-content-center mb-4"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "20px",
              background: "#dbeafe",
              fontSize: "34px",
            }}
          >
            🛡️
          </div>

          <h4 className="fw-bold mb-3">
            Verified Professionals
          </h4>

          <p className="text-muted mb-0">
            Connect with trusted professionals and
            experienced workers for your everyday needs.
          </p>

        </Card.Body>

      </Card>

    </Col>

    {/* FAST BOOKING */}
    <Col lg={4} md={6}>

      <Card
        className="border-0 shadow-sm rounded-4 h-100"
      >

        <Card.Body className="p-4 p-lg-5">

          <div
            className="d-flex align-items-center justify-content-center mb-4"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "20px",
              background: "#dcfce7",
              fontSize: "34px",
            }}
          >
            ⚡
          </div>

          <h4 className="fw-bold mb-3">
            Fast & Easy Booking
          </h4>

          <p className="text-muted mb-0">
            Find the right worker, choose your service
            and book quickly without unnecessary steps.
          </p>

        </Card.Body>

      </Card>

    </Col>

    {/* TRANSPARENT PRICING */}
    <Col lg={4} md={6}>

      <Card
        className="border-0 shadow-sm rounded-4 h-100"
      >

        <Card.Body className="p-4 p-lg-5">

          <div
            className="d-flex align-items-center justify-content-center mb-4"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "20px",
              background: "#fef3c7",
              fontSize: "34px",
            }}
          >
            💰
          </div>

          <h4 className="fw-bold mb-3">
            Fair & Transparent
          </h4>

          <p className="text-muted mb-0">
            Discover quality services with clear
            information and a better booking experience.
          </p>

        </Card.Body>

      </Card>

    </Col>

  </Row>

</Container>

      {/* STATISTICS */}
<section
  className="py-5 my-5"
  style={{
    background: "#f8fafc",
  }}
>
  <Container>

    <Row className="g-4 text-center">

      <Col lg={3} md={6}>
        <Card className="border-0 bg-transparent">
          <Card.Body>
            <h2 className="display-5 fw-bold text-primary">
              1,000+
            </h2>
            <p className="text-muted mb-0">
              Verified Workers
            </p>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={3} md={6}>
        <Card className="border-0 bg-transparent">
          <Card.Body>
            <h2 className="display-5 fw-bold text-success">
              5,000+
            </h2>
            <p className="text-muted mb-0">
              Happy Customers
            </p>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={3} md={6}>
        <Card className="border-0 bg-transparent">
          <Card.Body>
            <h2 className="display-5 fw-bold text-warning">
              10,000+
            </h2>
            <p className="text-muted mb-0">
              Services Booked
            </p>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={3} md={6}>
        <Card className="border-0 bg-transparent">
          <Card.Body>
            <h2 className="display-5 fw-bold text-danger">
              4.9★
            </h2>
            <p className="text-muted mb-0">
              Average Rating
            </p>
          </Card.Body>
        </Card>
      </Col>

    </Row>

  </Container>
</section>

{/* NEARBY WORKERS */}
<Container className="py-5 my-5">

  <div className="text-center mb-5">

    <Badge
      bg="primary"
      className="rounded-pill px-3 py-2 mb-3"
    >
      Nearby Professionals
    </Badge>

    <h2 className="display-6 fw-bold">
      Find Workers
      <br />
      <span className="text-primary">
        Near Your Location
      </span>
    </h2>

    <p
      className="text-muted mx-auto mt-3"
      style={{ maxWidth: "650px" }}
    >
      Explore available professionals around you and
      find the right worker for your service.
    </p>

  </div>

  <Card
    className="border-0 shadow-lg rounded-4 overflow-hidden"
  >

    <Card.Body className="p-2 p-md-3">

      <GoogleMapComponent workers={workers} />

    </Card.Body>

  </Card>

</Container>

{/* Featured Workers */}

<FeaturedWorkers
  workers={workers}
  workerSearch={workerSearch}
  setWorkerSearch={setWorkerSearch}
  selectedCity={selectedCity}
  setSelectedCity={setSelectedCity}
  availableOnly={availableOnly}
  setAvailableOnly={setAvailableOnly}
  minimumRating={minimumRating}
  setMinimumRating={setMinimumRating}
  sortBy={sortBy}
  setSortBy={setSortBy}
  navigate={navigate}
/>

{/* FOOTER */}
<footer
  className="text-white mt-5"
  style={{
    background:
      "linear-gradient(135deg,#0f172a,#172554)",
  }}
>
  <Container className="py-5">

    <Row className="g-5">

      {/* BRAND */}
      <Col lg={4} md={6}>

        <h4 className="fw-bold mb-3">
          🛠️ Service Marketplace
        </h4>

        <p
          className="text-white-50"
          style={{
            maxWidth: "350px",
          }}
        >
          Trusted services. Trusted workers.
          Find verified professionals and book
          quality services with confidence.
        </p>

        <div className="d-flex gap-2 mt-4">

          <Badge
            bg="light"
            text="dark"
            className="px-3 py-2"
          >
            🇵🇰 Pakistan
          </Badge>

          <Badge
            bg="primary"
            className="px-3 py-2"
          >
            ✓ Trusted Platform
          </Badge>

        </div>

      </Col>

      {/* QUICK LINKS */}
      <Col lg={2} md={6}>

        <h6 className="fw-bold mb-4">
          Platform
        </h6>

        <div className="d-flex flex-column gap-3">

          <a
            href="/"
            className="text-white-50 text-decoration-none"
          >
            Home
          </a>

          <a
            href="/services"
            className="text-white-50 text-decoration-none"
          >
            Services
          </a>

          <a
            href="/profile"
            className="text-white-50 text-decoration-none"
          >
            Profile
          </a>

          <a
            href="/notifications"
            className="text-white-50 text-decoration-none"
          >
            Notifications
          </a>

        </div>

      </Col>

      {/* FOR PROFESSIONALS */}
      <Col lg={3} md={6}>

        <h6 className="fw-bold mb-4">
          For Professionals
        </h6>

        <div className="d-flex flex-column gap-3">

          <a
            href="/register"
            className="text-white-50 text-decoration-none"
          >
            Become a Worker
          </a>

          <a
            href="/worker-dashboard"
            className="text-white-50 text-decoration-none"
          >
            Worker Dashboard
          </a>

          <a
            href="/services"
            className="text-white-50 text-decoration-none"
          >
            Browse Services
          </a>

        </div>

      </Col>

      {/* CONTACT */}
      <Col lg={3} md={6}>

        <h6 className="fw-bold mb-4">
          Contact Us
        </h6>

        <div className="d-flex flex-column gap-3">

          <div className="text-white-50">
            📧 support@servicemarketplace.com
          </div>

          <div className="text-white-50">
            📞 +92 300 1234567
          </div>

          <div className="text-white-50">
            📍 Lahore, Pakistan
          </div>

        </div>

      </Col>

    </Row>

    <hr
      className="my-5"
      style={{
        borderColor: "rgba(255,255,255,0.15)",
      }}
    />

    <Row className="align-items-center">

      <Col md={6}>

        <p className="text-white-50 mb-md-0">
          © 2026 Service Marketplace.
          All Rights Reserved.
        </p>

      </Col>

      <Col
        md={6}
        className="text-md-end"
      >

        <span className="text-white-50">
          Built for trusted local services 🇵🇰
        </span>

      </Col>

    </Row>

  </Container>
</footer>
    </>
  );
}

export default Home;