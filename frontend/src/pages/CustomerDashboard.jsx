import { useEffect, useState } from "react";
import { Container, Card, Badge, Button } from "react-bootstrap";
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

      <div className="text-center mb-5">
    <h1 className="fw-bold">
        👋 Welcome Back
    </h1>

    <h3 className="text-primary">
        {dashboard.customer}
    </h3>

    <p className="text-muted">
        Manage all your bookings from one place.
    </p>
</div>


 <div className="row g-4 mb-5">

  <div className="col-md-4">
    <Card className="shadow border-0 text-center p-3">
      <h5>📅 Total Bookings</h5>
      <h2 className="text-primary">{dashboard.total_bookings}</h2>
    </Card>
  </div>

  <div className="col-md-4">
    <Card className="shadow border-0 text-center p-3">
      <h5>🟡 Pending</h5>
      <h2 className="text-warning">{dashboard.pending}</h2>
    </Card>
  </div>

  <div className="col-md-4">
    <Card className="shadow border-0 text-center p-3">
      <h5>🟢 Accepted</h5>
      <h2 className="text-success">{dashboard.accepted}</h2>
    </Card>
  </div>

  <div className="col-md-4">
    <Card className="shadow border-0 text-center p-3">
      <h5>🔵 Completed</h5>
      <h2 className="text-info">{dashboard.completed}</h2>
    </Card>
  </div>

  <div className="col-md-4">
    <Card className="shadow border-0 text-center p-3">
      <h5>🔴 Cancelled</h5>
      <h2 className="text-danger">{dashboard.cancelled}</h2>
    </Card>
  </div>

  <div className="col-md-4">
    <Card className="shadow border-0 text-center p-3">
      <h5>⚫ Rejected</h5>
      <h2 className="text-dark">{dashboard.rejected}</h2>
    </Card>
  </div>

</div>
<hr className="mb-4" />

<h2 className="fw-bold mb-4">
    📋 My Bookings
</h2>

{dashboard.bookings.map((booking) => (

<Card
    key={booking.id}
    className="shadow-lg border-0 rounded-4 p-4 mb-4"
style={{
    transition: "0.3s",
    cursor: "pointer",
}}
>

    <h4 className="fw-bold text-primary mb-3">
        🔧 {booking.service.name}
    </h4>

    <p className="mb-2">
        <strong>👷 Worker:</strong>{" "}
        {booking.worker.name}
    </p>

    <p className="mb-2">
        <strong>📅 Date:</strong>{" "}
       {new Date(booking.booking_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
})}
    </p>

    <p className="mb-3">
        <strong>📌 Status:</strong>{" "}
        <Badge bg={getBadgeColor(booking.status)}>
            {booking.status}
        </Badge>
    </p>

    {booking.status === "pending" && (

        <Button
            variant="danger"
            onClick={() => cancelBooking(booking.id)}
        >
            ❌ Cancel Booking
        </Button>

    )}

</Card>

))}

    </Container>
  );
}

export default CustomerDashboard;