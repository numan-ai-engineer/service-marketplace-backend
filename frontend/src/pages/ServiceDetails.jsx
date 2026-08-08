import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import api from "../utils/api";

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/services/${id}/`);

        console.log("Service Details:", response.data);

        if (response.ok) {
          setService(response.data);
        } else {
          setError("Unable to load this service.");
        }
      } catch (error) {
        console.log("Service Details Error:", error);
        setError("Something went wrong while loading the service.");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  const handleBooking = async () => {
    try {
      setBooking(true);

      const response = await api.post("/bookings/", {
        service: id,
      });

      const data = response.data;

      console.log("Booking Response:", data);

      if (response.ok) {
        alert("Booking Created Successfully");
      } else {
        alert(data.error || "Booking Failed");
      }
    } catch (error) {
      console.log("Booking Error:", error);
      alert("Server Error");
    } finally {
      setBooking(false);
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
          Loading service...
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

        <Button
          variant="outline-primary"
          onClick={() => navigate("/services")}
        >
          ← Back to Services
        </Button>

      </Container>
    );
  }

  /* SERVICE NOT FOUND */
  if (!service) {
    return (
      <Container className="py-5 text-center">

        <div style={{ fontSize: "60px" }}>
          🔍
        </div>

        <h3 className="fw-bold mt-3">
          Service Not Found
        </h3>

        <p className="text-muted">
          The service you are looking for does not exist.
        </p>

        <Button
          onClick={() => navigate("/services")}
        >
          Browse Services
        </Button>

      </Container>
    );
  }

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
        <Container className="py-4">

          <Button
            variant="outline-light"
            className="rounded-pill mb-4"
            onClick={() => navigate("/services")}
          >
            ← Back to Services
          </Button>

          <Row className="align-items-center">

            <Col lg={8}>

              <Badge
                bg="light"
                text="primary"
                className="rounded-pill px-3 py-2 mb-3"
              >
                🛠️ Professional Service
              </Badge>

              <h1 className="display-4 fw-bold text-white">
                {service.name}
              </h1>

              <p
                className="lead text-white-50 mt-3"
                style={{
                  maxWidth: "750px",
                }}
              >
                Reliable professionals are ready
                to help you with this service.
              </p>

            </Col>

          </Row>

        </Container>
      </section>

      {/* DETAILS */}
      <Container className="py-5">

        <Row className="g-4">

          {/* MAIN DETAILS */}
          <Col lg={8}>

            <Card className="border-0 shadow-sm rounded-4">

              <Card.Body className="p-4 p-lg-5">

                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg,#2563eb,#7c3aed)",
                    fontSize: "42px",
                  }}
                >
                  🛠️
                </div>

                <h2 className="fw-bold mb-3">
                  About This Service
                </h2>

                <p
                  className="text-muted"
                  style={{
                    fontSize: "17px",
                    lineHeight: "1.8",
                  }}
                >
                  {service.description ||
                    "Professional service provided by trusted and experienced workers."}
                </p>

                <hr className="my-4" />

                <h4 className="fw-bold mb-4">
                  Why Choose This Service?
                </h4>

                <Row className="g-4">

                  <Col md={4}>

                    <div className="text-center">

                      <div
                        style={{
                          fontSize: "32px",
                        }}
                      >
                        ✓
                      </div>

                      <h6 className="fw-bold mt-2">
                        Trusted Workers
                      </h6>

                      <p className="text-muted small">
                        Connect with professionals.
                      </p>

                    </div>

                  </Col>

                  <Col md={4}>

                    <div className="text-center">

                      <div
                        style={{
                          fontSize: "32px",
                        }}
                      >
                        ⭐
                      </div>

                      <h6 className="fw-bold mt-2">
                        Quality Service
                      </h6>

                      <p className="text-muted small">
                        Quality-focused professionals.
                      </p>

                    </div>

                  </Col>

                  <Col md={4}>

                    <div className="text-center">

                      <div
                        style={{
                          fontSize: "32px",
                        }}
                      >
                        ⚡
                      </div>

                      <h6 className="fw-bold mt-2">
                        Fast Booking
                      </h6>

                      <p className="text-muted small">
                        Request a service quickly.
                      </p>

                    </div>

                  </Col>

                </Row>

              </Card.Body>

            </Card>

          </Col>

          {/* BOOKING CARD */}
          <Col lg={4}>

            <Card
              className="border-0 shadow-lg rounded-4 sticky-lg-top"
              style={{
                top: "90px",
              }}
            >

              <Card.Body className="p-4">

                <Badge
                  bg="success"
                  className="rounded-pill px-3 py-2 mb-3"
                >
                  ✓ Available
                </Badge>

                <h4 className="fw-bold">
                  {service.name}
                </h4>

                <p className="text-muted">
                  Ready to book this service?
                </p>

                <hr />

                <div className="mb-4">

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Service
                    </span>

                    <strong>
                      {service.name}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span className="text-muted">
                      Status
                    </span>

                    <span className="text-success fw-semibold">
                      Available
                    </span>
                  </div>

                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 rounded-pill fw-semibold"
                  onClick={handleBooking}
                  disabled={booking}
                >
                  {booking ? (
                    <>
                      <Spinner
                        size="sm"
                        animation="border"
                        className="me-2"
                      />
                      Booking...
                    </>
                  ) : (
                    "Book This Service"
                  )}
                </Button>

                <p className="text-muted text-center small mt-3 mb-0">
                  You can review your booking after submission.
                </p>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      </Container>
    </>
  );
}

export default ServiceDetails;