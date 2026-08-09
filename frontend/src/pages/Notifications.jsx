import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Card, Badge } from "react-bootstrap";
import api from "../utils/api";

function Notifications() {
  const navigate = useNavigate();

const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const token = localStorage.getItem("access");

    const response = await api.get("/notifications/", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    console.log("NOTIFICATIONS:", response.data);

      setNotifications(response.data);
    
  };

  return (
    <Container className="mt-5">

      <h2 className="mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <h5>No Notifications</h5>
      ) : (
        notifications.map((notification) => (
         <Card
  key={notification.id}
  onClick={() => {
  console.log("CLICKED NOTIFICATION:", notification);
  
  if (notification.booking_id) {
    console.log("BOOKING ID:", notification.booking_id);
    navigate("/worker-dashboard");
  }
}}
  className={`shadow p-3 mb-3 ${
    notification.booking_id
      ? "cursor-pointer hover:shadow-lg"
      : ""
  }`}
>
            <h5>{notification.message}</h5>

            <p>
              {notification.created_at}
            </p>

            <Badge
              bg={
                notification.is_read
                  ? "success"
                  : "warning"
              }
            >
              {notification.is_read
                ? "Read"
                : "Unread"}
            </Badge>
          </Card>
        ))
      )}
    </Container>
  );
}

export default Notifications;