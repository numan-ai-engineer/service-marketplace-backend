import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

function ServiceDetails() {
  const { id } = useParams();

  const [service, setService] = useState(null);

  useEffect(() => {
    const loadService = async () => {
  try {
    const response = await api.get(`/services/${id}/`);

    console.log(response.data);

    if (response.ok) {
      setService(response.data);
    }
  } catch (error) {
    console.log(error);
  }
};

loadService();
  }, [id]);

  if (!service) {
    return <h2>Loading...</h2>;
  }
  const handleBooking = async () => {
  try {
    const response = await api.post("/bookings/", {
  service: id,
});

const data = response.data;

    if (response.ok) {
      alert("Booking Created Successfully");
    } else {
      alert(data.error || "Booking Failed");
    }
  } catch (error) {
    console.log(error);
    alert("Server Error");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>{service.name}</h2>

      <p>{service.description}</p>

      <button onClick={handleBooking}>
  Book Now
</button>
    </div>
  );
}

export default ServiceDetails;