import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

    const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");

  const [selectedWorker, setSelectedWorker] = useState(null);

  const loadPendingWorkers = async () => {
    const token = localStorage.getItem("access");

    const response = await fetch(
      "http://127.0.0.1:8000/api/admin/pending-workers/",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Pending Workers:", data);

    if (response.ok) {
      setWorkers(data);
    } else {
      alert(data.error || "Error");
    }
  };

  const loadDashboardStats = async () => {

    const token = localStorage.getItem("access");

    const response = await fetch(
        "http://127.0.0.1:8000/api/admin/dashboard/",
        {
            headers: {
                Authorization: "Bearer " + token,
            },
        }
    );

    const data = await response.json();

    console.log("Dashboard Stats:", data);

    if (response.ok) {
        setStats(data);
    }
};

  const verifyWorker = async (workerId, action) => {

    const token = localStorage.getItem("access");

    const response = await fetch(
        `http://127.0.0.1:8000/api/admin/verify-worker/${workerId}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                action: action,
            }),
        }
    );

    const data = await response.json();

    alert(data.message || data.error);

    loadPendingWorkers();
};

  useEffect(() => {

    loadPendingWorkers();

    loadDashboardStats();

}, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {stats && (

    <div
        style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            marginBottom: "20px",
            flexWrap: "wrap",
        }}
    >

        <div
            style={{
                border: "1px solid gray",
                padding: "20px",
                borderRadius: "10px",
                width: "180px",
            }}
        >
            <h3>👷 Total Workers</h3>
            <h2>{stats.total_workers}</h2>
        </div>

        <div
            style={{
                border: "1px solid orange",
                padding: "20px",
                borderRadius: "10px",
                width: "180px",
            }}
        >
            <h3>🟡 Pending</h3>
            <h2>{stats.pending}</h2>
        </div>

        <div
            style={{
                border: "1px solid green",
                padding: "20px",
                borderRadius: "10px",
                width: "180px",
            }}
        >
            <h3>🟢 Approved</h3>
            <h2>{stats.approved}</h2>
        </div>

        <div
            style={{
                border: "1px solid red",
                padding: "20px",
                borderRadius: "10px",
                width: "180px",
            }}
        >
            <h3>🔴 Rejected</h3>
            <h2>{stats.rejected}</h2>
        </div>

    </div>

)}

<input
    type="text"
    placeholder="Search Worker..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
        padding: "10px",
        width: "300px",
        marginTop: "20px",
        marginBottom: "20px",
    }}
/>


      <hr />

      {workers.length === 0 ? (
        <h3>No Pending Workers</h3>
      ) : (
        workers
  .filter((worker) => {
    return (
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      worker.cnic.includes(search)
    );
  })
  .map((worker) => (
          <div
            key={worker.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{worker.name}</h3>

            <p><b>CNIC:</b> {worker.cnic}</p>

<p><b>City:</b> {worker.city}</p>

<p><b>Experience:</b> {worker.experience} Years</p>

<p><b>Rating:</b> ⭐ {worker.rating}</p>

<p><b>Status:</b> {worker.status}</p>

<p>
    <b>Services:</b>
</p>

<ul>
    {worker.services.map((service, index) => (
        <li key={index}>
            {service}
        </li>
    ))}
</ul>

            <h4>CNIC Front</h4>

<img
    src={worker.cnic_front}
    alt="CNIC Front"
    width="300"
/>

<br /><br />

<h4>CNIC Back</h4>

<img
    src={worker.cnic_back}
    alt="CNIC Back"
    width="300"
/>

<br /><br />

<h4>Selfie</h4>

<img
    src={worker.selfie}
    alt="Selfie"
    width="250"
/>

<br /><br />

<button
    onClick={() => verifyWorker(worker.id, "approve")}
>
    ✅ Approve
</button>

<button
    style={{ marginLeft: "10px" }}
    onClick={() => verifyWorker(worker.id, "reject")}
>
    ❌ Reject
</button>

<br /><br />

<button
    onClick={() => navigate(`/worker/${worker.id}`)}
>
    👁 View Profile
</button>

          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;