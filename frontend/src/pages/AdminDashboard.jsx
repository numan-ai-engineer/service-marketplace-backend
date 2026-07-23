import { useEffect, useState } from "react";

function AdminDashboard() {
  const [workers, setWorkers] = useState([]);

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
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <hr />

      {workers.length === 0 ? (
        <h3>No Pending Workers</h3>
      ) : (
        workers.map((worker) => (
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

            <p>CNIC: {worker.cnic}</p>

            <p>Status: {worker.status}</p>

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

          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;