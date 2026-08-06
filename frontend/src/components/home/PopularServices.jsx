import { Container, Row, Col, Card, Button } from "react-bootstrap";

function PopularServices({ services, navigate }) {
  return (
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
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

                <h4>{service.name}</h4>

                <p className="text-muted">
                  {service.description}
                </p>

                <Button
                  onClick={() =>
                    navigate(`/services/${service.id}`)
                  }
                >
                  View Service
                </Button>

              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default PopularServices;