import { useState } from "react";
import Login from "./Login";
import Services from "./Services";
import MyBookings from "./MyBookings";
import WorkerDashboard from "./WorkerDashboard";

function App() {
  const [page, setPage] = useState("services");
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Service Marketplace</h1>

      {!loggedIn ? (
        <Login setLoggedIn={setLoggedIn} />
      ) : (
        <>
          <button onClick={() => setPage("services")}>
            Services
          </button>

          <button
            onClick={() => setPage("bookings")}
            style={{ marginLeft: "10px" }}
          >
            My Bookings
          </button>

          <button
            onClick={() => setPage("worker")}
            style={{ marginLeft: "10px" }}
          >
            Worker Dashboard
          </button>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              localStorage.removeItem("token");
              setLoggedIn(false);
            }}
          >
            Logout
          </button>

          <hr />

          {page === "services" && <Services />}

          {page === "bookings" && <MyBookings />}

          {page === "worker" && <WorkerDashboard />}
        </>
      )}
    </div>
  );
}

export default App;