import { useEffect, useState } from "react";

function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/services/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Services:", data);
        setServices(data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleBooking = async (serviceId) => {
    alert("Button Clicked");

    console.log("Service ID:", serviceId);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/bookings/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            service: serviceId,
          }),
        }
      );

      const data = await response.json();

      console.log("Booking Response:", data);

      if (response.ok) {
        alert("Booking Created Successfully");
      } else {
        alert(data.error || "Booking Failed");
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Services</h2>

      {services.map((service) => (
        <div
          key={service.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "10px",
          }}
        >
          <h3>{service.name}</h3>

          <p>{service.description}</p>

          <button onClick={() => handleBooking(service.id)}>
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}

export default Services;