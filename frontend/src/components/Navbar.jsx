import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    console.log(user);

  return (
    <nav
      style={{
        padding: "15px",
        backgroundColor: "#1976d2",
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          marginRight: "20px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Home
      </Link>

      {!user && (
  <Link
    to="/login"
    style={{
      color: "white",
      marginRight: "20px",
      textDecoration: "none",
    }}
  >
    Login
  </Link>
)}
{user && (
  <Link
    to="/services"
    style={{
      color: "white",
      textDecoration: "none",
    }}
  >
    Services
  </Link>
)}
    
{user?.role === "customer" && (
  <Link
    to="/my-bookings"
    style={{
      color: "white",
      marginLeft: "20px",
      textDecoration: "none",
    }}
  >
    My Bookings
  </Link>
)}
{user?.role === "worker" && (
  <Link
    to="/worker-dashboard"
    style={{
      color: "white",
      marginLeft: "20px",
      textDecoration: "none",
    }}
  >
    Worker Dashboard
  </Link>
)}

{user && (
  <button
    onClick={() => {
      localStorage.removeItem("token");
      navigate("/login");
    }}
    style={{
      marginLeft: "20px",
      padding: "5px 10px",
      cursor: "pointer",
    }}
  >
    Logout
  </button>
)}
    </nav>
  );
}

export default Navbar;