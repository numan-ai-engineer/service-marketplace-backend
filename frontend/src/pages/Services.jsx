import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
} from "react-bootstrap";

function Services() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get("/services/");

        console.log("Services:", response.data);

        if (response.ok) {
          setServices(response.data);
        }
      } catch (error) {
        console.log("Services Error:", error);
      }
    };

    loadServices();
  }, []);

  const handleBooking = async (serviceId) => {
    console.log("Service ID:", serviceId);

    try {
      const response = await api.post("/bookings/", {
  worker: 2,
  service: serviceId,
});

if (response.status >= 200 && response.status < 300) {
  alert("Booking Created Successfully");
}

      const data = response.data;

      console.log("Booking Response:", data);

      if (response.ok) {
        alert("Booking Created Successfully");
      } else {
        alert(data.error || "Booking Failed");
      }
    } catch (error) {
      console.log("Booking Error:", error);
      alert("Something went wrong");
    }
  };

  const filteredServices = services.filter((service) =>
    service.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {/* HERO */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg,#0f172a,#1d4ed8,#312e81)",
        }}
      >
        <Container className="py-5">

          <div className="text-center text-white">

            <Badge
              bg="light"
              text="primary"
              className="rounded-pill px-3 py-2 mb-3"
            >
              🛠️ Trusted Services
            </Badge>

            <h1 className="display-4 fw-bold">
              Find the Right Service
              <br />
              <span className="text-white">
                For Your Needs
              </span>
            </h1>

            <p
              className="lead text-white-50 mx-auto mt-4"
              style={{
                maxWidth: "700px",
              }}
            >
              Browse trusted professionals and find
              reliable services for your home, business
              and everyday needs.
            </p>

          </div>

        </Container>
      </section>

      {/* SERVICES */}
      <Container className="py-5">

        {/* SEARCH */}
        <Card
          className="border-0 shadow-sm rounded-4 mb-5"
        >
          <Card.Body className="p-4">

            <Row className="align-items-center">

              <Col lg={8} md={7}>

                <label className="form-label fw-semibold">
                  Search Services
                </label>

                <input
                  type="text"
                  placeholder="Search electrician, plumber, AC repair..."
                  className="form-control form-control-lg rounded-3"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </Col>

              <Col
                lg={4}
                md={5}
                className="text-md-end mt-3 mt-md-0"
              >

                <div className="text-muted">
                  Showing
                </div>

                <h4 className="fw-bold mb-0">
                  {filteredServices.length} Services
                </h4>

              </Col>

            </Row>

          </Card.Body>
        </Card>

        {/* HEADING */}
        <div className="mb-4">

          <h2 className="fw-bold">
            Popular Services
          </h2>

          <p className="text-muted">
            Choose a service and explore trusted
            professionals.
          </p>

        </div>

        {/* SERVICE CARDS */}
        <Row className="g-4">

          {filteredServices.map((service) => (

            <Col
              lg={4}
              md={6}
              key={service.id}
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

                  {/* ICON */}
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "20px",
                      background:
                        "linear-gradient(135deg,#2563eb,#7c3aed)",
                      fontSize: "32px",
                    }}
                  >
                    🛠️
                  </div>

                  {/* SERVICE NAME */}
                  <h4 className="fw-bold">
                    {service.name}
                  </h4>

                  {/* DESCRIPTION */}
                  <p className="text-muted mt-3">
                    {service.description ||
                      "Professional service provided by trusted workers."}
                  </p>

                  {/* TRUST BADGE */}
                  <Badge
                    bg="light"
                    text="success"
                    className="border border-success mb-4 px-3 py-2"
                  >
                    ✓ Trusted Service
                  </Badge>

                  {/* BUTTON */}
                  <Button
                    variant="primary"
                    className="rounded-pill w-100 py-2 fw-semibold"
                    onClick={() =>
                      navigate(
                        `/services/${service.id}`
                      )
                    }
                  >
                    View Service →
                  </Button>

                </Card.Body>

              </Card>

            </Col>

          ))}

        </Row>

        {/* EMPTY STATE */}
        {filteredServices.length === 0 && (

          <Card
            className="border-0 shadow-sm rounded-4 text-center py-5 mt-4"
          >

            <Card.Body>

              <div
                style={{
                  fontSize: "50px",
                }}
              >
                🔍
              </div>

              <h4 className="fw-bold mt-3">
                No Services Found
              </h4>

              <p className="text-muted">
                Try another service name.
              </p>

            </Card.Body>

          </Card>

        )}

      </Container>
    </>
  );
}

export default Services;