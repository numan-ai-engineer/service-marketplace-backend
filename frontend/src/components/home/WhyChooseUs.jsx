import { Container, Row, Col } from "react-bootstrap";

function WhyChooseUs() {
  return (
    <Container className="my-5">
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
  );
}

export default WhyChooseUs;