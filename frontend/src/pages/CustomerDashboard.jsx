import { useEffect, useState } from "react";
import { Container, Card, Badge } from "react-bootstrap";
import api from "../utils/api";

function CustomerDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem("access");

    const response = await api.get("/customer/dashboard/", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    console.log(response);

    if (response.ok) {
      setDashboard(response.data);
    }
  };

  if (!dashboard) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <Container className="mt-5">

      <h2 className="mb-4">
        Welcome {dashboard.customer}
      </h2>

      <h4>
        Total Bookings: {dashboard.total_bookings}
      </h4>

      <hr />

      {dashboard.bookings.map((booking) => (
        <Card
          key={booking.id}
          className="shadow p-3 mb-3"
        >
          <h4>{booking.service.name}</h4>

          <p>
            Worker: {booking.worker.name}
          </p>

          <p>
            Status:
            {" "}
            <Badge bg="primary">
              {booking.status}
            </Badge>
          </p>

          <p>
            Date: {booking.booking_date}
          </p>
        </Card>
      ))}

    </Container>
  );
}

export default CustomerDashboard;