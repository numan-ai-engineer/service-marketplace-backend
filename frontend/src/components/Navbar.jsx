import { Link } from "react-router-dom";

function Navbar() {
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

      <Link
        to="/services"
        style={{
          color: "white",
          textDecoration: "none",
        }}
      >
        Services
      </Link>
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
    </nav>
  );
}

export default Navbar;