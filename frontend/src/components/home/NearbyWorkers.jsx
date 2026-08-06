import { Container } from "react-bootstrap";
import GoogleMapComponent from "../GoogleMap";

function NearbyWorkers({ workers }) {
  return (
    <Container className="my-5">
      <h2 className="text-center fw-bold mb-4">
        Nearby Workers
      </h2>

      <GoogleMapComponent workers={workers} />
    </Container>
  );
}

export default NearbyWorkers;