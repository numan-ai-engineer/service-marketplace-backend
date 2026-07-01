import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

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
    console.log(error);
  }
};

loadServices();
  }, []);

  const handleBooking = async (serviceId) => {
    

    console.log("Service ID:", serviceId);

    try {
      const response = await api.post("/bookings/", {
  service: serviceId,
});

const data = response.data;

      console.log("Booking Response:", data);

      if (response.ok) {
        alert("Booking Created Successfully");
      } else {
        alert(data.error || "Booking Failed");
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <Container className="mt-5">
      <h2>Available Services</h2>
      <input
  type="text"
  placeholder="Search Services..."
  className="form-control mb-4"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

      <Row className="mt-4">

      {services
  .filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((service) => (
        <Col md={4} className="mb-4" key={service.id}>
  <Card className="shadow h-100">
  <Card.Body>

    <Card.Title>{service.name}</Card.Title>

    <Card.Text>
      {service.description}
    </Card.Text>

    <Button
  variant="primary"
  onClick={() => navigate(`/services/${service.id}`)}
>
  View Details
</Button>
    </Card.Body>
</Card>
</Col>
))}

       </Row>
</Container> 
  );
}

export default Services;