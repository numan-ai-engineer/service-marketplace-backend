import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Badge } from "react-bootstrap";

function BookingDetails() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch(`http://127.0.0.1:8000/api/bookings/${id}/`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setBooking(data);
      })
      .catch((error) => console.log(error));
  }, [id]);

  if (!booking) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <Container className="mt-5">
      <Card className="shadow p-4">

        <h2 className="mb-4">Booking Details</h2>

        <h5>
          <strong>Service:</strong> {booking.service?.name}
        </h5>

        <h5 className="mt-3">
          <strong>Customer:</strong> {booking.customer?.name}
        </h5>

        <h5 className="mt-3">
          <strong>Customer Phone:</strong> {booking.customer?.phone}
        </h5>

        <h5 className="mt-3">
          <strong>Worker:</strong> {booking.worker?.name}
        </h5>

        <h5 className="mt-3">
          <strong>Worker Phone:</strong> {booking.worker?.phone}
        </h5>

        <h5 className="mt-3">
          <strong>Status:</strong>{" "}
          <Badge bg="success">
            {booking.status}
          </Badge>
        </h5>

        <h5 className="mt-3">
          <strong>Booking Date:</strong> {booking.created_at}
        </h5>

      </Card>
    </Container>
  );
}

export default BookingDetails;