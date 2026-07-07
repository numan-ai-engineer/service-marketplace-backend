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

const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem("access");

  const response = await api.patch(
    `/bookings/${bookingId}/status/`,
    {
      status: "cancelled",
    },
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  console.log(response);

  if (response.ok) {
    alert("Booking Cancelled Successfully!");
    loadDashboard();
  } else {
    alert("Cancel Failed!");
  }
};

if (!dashboard) {
  return <h2 className="text-center mt-5">Loading...</h2>;
}

const getBadgeColor = (status) => {
  switch (status) {
    case "pending":
      return "warning";

    case "accepted":
      return "success";

    case "completed":
      return "primary";

    case "rejected":
      return "danger";

    case "cancelled":
      return "dark";

    default:
      return "secondary";
  }
};

  return (
    <Container className="mt-5">

      <h2 className="mb-4">
        Welcome {dashboard.customer}
      </h2>

      <div className="mb-4">

  <h4>Total Bookings: {dashboard.total_bookings}</h4>

  <p>🟡 Pending: {dashboard.pending}</p>

  <p>🟢 Accepted: {dashboard.accepted}</p>

  <p>🔵 Completed: {dashboard.completed}</p>

  <p>🔴 Cancelled: {dashboard.cancelled}</p>

  <p>⚫ Rejected: {dashboard.rejected}</p>

</div>

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
           <Badge bg={getBadgeColor(booking.status)}>
  {booking.status}
</Badge>
          </p>

          <p>
            Date: {booking.booking_date}
          </p>
          {booking.status === "pending" && (
  <Button
  variant="danger"
  onClick={() => cancelBooking(booking.id)}
>
  Cancel Booking
</Button>
)}
        </Card>
      ))}

    </Container>
  );
}

export default CustomerDashboard;