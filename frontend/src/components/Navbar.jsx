import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);
  const [notificationCount, setNotificationCount] = useState(0);

  console.log(user);
const loadNotificationCount = async () => {
  const token = localStorage.getItem("access");

  if (!token) return;

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/notifications/count/",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await response.json();
    console.log("Notification Count API:", JSON.stringify(data));
    setNotificationCount(data.count);
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  if (user) {
    loadNotificationCount();
  }
}, [user]);
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          Service Marketplace
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {!user && (
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            )}
    
            {user && (
              <Nav.Link as={Link} to="/services">
                Services
              </Nav.Link>
            )}

            {user && (
              <Nav.Link as={Link} to="/profile">
                Profile
              </Nav.Link>
            )}

            {user && (
  <Nav.Link as={Link} to="/notifications">
    🔔 Notifications
    {notificationCount > 0 && (
      <span
        style={{
          color: "yellow",
          fontWeight: "bold",
          marginLeft: "5px",
        }}
      >
        ({notificationCount})
      </span>
    )}
  </Nav.Link>
)}
            


            {user?.role === "customer" && (
              <Nav.Link as={Link} to="/my-bookings">
                My Bookings
              </Nav.Link>
            )}

            {user?.role === "worker" && (
              <Nav.Link as={Link} to="/worker-dashboard">
                Worker Dashboard
              </Nav.Link>
            )}
          </Nav>

          {user?.role === "customer" && (
  <Nav.Link as={Link} to="/customer-dashboard">
    Customer Dashboard
  </Nav.Link>
)}

          {user && (
            <Button
              variant="light"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;