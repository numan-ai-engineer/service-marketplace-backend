import { Container, Row, Col } from "react-bootstrap";

function Statistics() {
  return (
    <Container className="my-5">
      <Row className="text-center">

        <Col md={3}>
          <h1 className="text-primary fw-bold">
            1000+
          </h1>
          <h5>Workers</h5>
        </Col>

        <Col md={3}>
          <h1 className="text-success fw-bold">
            5000+
          </h1>
          <h5>Customers</h5>
        </Col>

        <Col md={3}>
          <h1 className="text-warning fw-bold">
            10000+
          </h1>
          <h5>Bookings</h5>
        </Col>

        <Col md={3}>
          <h1 className="text-danger fw-bold">
            4.9★
          </h1>
          <h5>Average Rating</h5>
        </Col>

      </Row>
    </Container>
  );
}

export default Statistics;