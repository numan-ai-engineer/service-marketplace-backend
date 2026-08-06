import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import GoogleMapComponent from "../components/GoogleMap";
import { Input } from "@/components/ui/input";
import Hero from "../components/home/Hero";
import PopularServices from "../components/home/PopularServices";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Statistics from "../components/home/Statistics";
import NearbyWorkers from "../components/home/NearbyWorkers";
import FeaturedWorkers from "../components/home/FeaturedWorkers";
import {
  Button,
  Card,
  Badge,
  Container,
  Row,
  Col,
} from "react-bootstrap";


function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState("");
  const [sortBy, setSortBy] = useState("");
const loadServices = async () => {
  const response = await api.get("/services/");

  console.log(response);
  if (response.ok) {
    setServices(response.data);
  }
};

const loadWorkers = async () => {
  const response = await api.get("/workers/");

  console.log("API RESPONSE:", response);

  if (response.ok) {
    console.log("Workers:", response.data);

    setWorkers(response.data);
  } else {
    console.log("API FAILED");
  }
};

useEffect(() => {
  loadServices();
  loadWorkers();
}, []);

return (
    <>
      {/* HERO SECTION */}

<Hero navigate={navigate} />

      {/* Popular Services */}
    
    <PopularServices
  services={services}
  navigate={navigate}
/>

      {/* Why Choose Us */}
      
      <WhyChooseUs />

      {/* Statistics */}

<Statistics />

<NearbyWorkers workers={workers} />

{/* Featured Workers */}

<FeaturedWorkers
  workers={workers}
  workerSearch={workerSearch}
  setWorkerSearch={setWorkerSearch}
  selectedCity={selectedCity}
  setSelectedCity={setSelectedCity}
  availableOnly={availableOnly}
  setAvailableOnly={setAvailableOnly}
  minimumRating={minimumRating}
  setMinimumRating={setMinimumRating}
  sortBy={sortBy}
  setSortBy={setSortBy}
  navigate={navigate}
/>

{/* Footer */}

<footer
  style={{
    backgroundColor: "#212529",
    color: "white",
    padding: "40px 0",
    marginTop: "50px",
  }}
>
  <Container>

    <Row>

      <Col md={4}>
        <h4>Service Marketplace</h4>
        <p>
          Find trusted workers for your daily needs.
        </p>
      </Col>

      <Col md={4}>
        <h4>Quick Links</h4>

        <p>Home</p>
        <p>Services</p>
        <p>Profile</p>
      </Col>

      <Col md={4}>
        <h4>Contact</h4>

        <p>📧 support@servicemarketplace.com</p>

        <p>📞 +92 300 1234567</p>

        <p>📍 Lahore, Pakistan</p>
      </Col>

    </Row>

    <hr style={{ borderColor: "#555" }} />

    <p className="text-center mb-0">
      © 2026 Service Marketplace. All Rights Reserved.
    </p>

  </Container>
</footer>
    </>
  );
}

export default Home;