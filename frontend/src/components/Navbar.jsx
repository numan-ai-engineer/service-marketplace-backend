import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);

  console.log(user);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

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