import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
  return (
  <Container className="text-center mt-5">

    <h1 className="display-4 fw-bold">
      Service Marketplace
    </h1>

    <p className="lead mt-3">
      Find Trusted Workers Near You
    </p>

    <p>
      Book Electrician, Plumber, Driver,
      Painter and many more services.
    </p>

    <Button
      variant="primary"
      size="lg"
      onClick={() => navigate("/services")}
    >
      Find Services
    </Button>
    <hr className="my-5" />

<h2 className="mb-4">Our Popular Services</h2>

<div className="row">

  <div className="col-md-3">
    <div className="card p-3 shadow">
      <h4>⚡ Electrician</h4>
      <p>Electrical Repair Services</p>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow">
      <h4>🚿 Plumber</h4>
      <p>Professional Plumbing</p>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow">
      <h4>🚗 Driver</h4>
      <p>Trusted Drivers</p>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow">
      <h4>🎨 Painter</h4>
      <p>House Painting Services</p>
    </div>
  </div>

</div>

  </Container>
);
}

export default Home;