import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");

  // =========================================
  // LOAD PENDING VERIFICATIONS
  // =========================================

  const loadPendingWorkers = async () => {
    const token = localStorage.getItem("access");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/pending-verifications/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Verification Status:", response.status);
      console.log("Pending Verifications:", data);

      if (response.ok) {
        setWorkers(data);
      } else {
        alert(data.error || "Error loading pending verifications");
      }
    } catch (error) {
      console.error("Pending verification error:", error);
      alert("Unable to load pending verifications.");
    }
  };

  // =========================================
  // LOAD DASHBOARD STATS
  // =========================================

  const loadDashboardStats = async () => {
    const token = localStorage.getItem("access");

    try {
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
      } else {
        console.error("Dashboard stats error:", data);
      }
    } catch (error) {
      console.error("Dashboard stats error:", error);
    }
  };

  // =========================================
  // APPROVE / REJECT WORKER
  // =========================================

  const verifyWorker = async (workerId, action) => {
    const token = localStorage.getItem("access");

    try {
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

      console.log("Verification Response:", data);

      alert(data.message || data.error);

      if (response.ok) {
        loadPendingWorkers();
        loadDashboardStats();
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Unable to process verification.");
    }
  };

  // =========================================
  // LOAD DATA
  // =========================================

  useEffect(() => {
    loadPendingWorkers();
    loadDashboardStats();
  }, []);

  // =========================================
  // SEARCH
  // =========================================

  const filteredWorkers = workers.filter((worker) => {
    const workerName = worker.worker_name || "";
    const documentNumber = worker.document_number || "";

    const searchText = search.toLowerCase();

    return (
      workerName.toLowerCase().includes(searchText) ||
      documentNumber.toLowerCase().includes(searchText)
    );
  });

  // =========================================
  // UI
  // =========================================

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* =====================================
          DASHBOARD STATISTICS
      ====================================== */}

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
              border: "1px solid blue",
              padding: "20px",
              borderRadius: "10px",
              width: "180px",
            }}
          >
            <h3>👥 Total Users</h3>
            <h2>{stats.total_users}</h2>
          </div>

          <div
            style={{
              border: "1px solid purple",
              padding: "20px",
              borderRadius: "10px",
              width: "180px",
            }}
          >
            <h3>🙍 Customers</h3>
            <h2>{stats.total_customers}</h2>
          </div>

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

          <div
            style={{
              border: "1px solid black",
              padding: "20px",
              borderRadius: "10px",
              width: "180px",
            }}
          >
            <h3>📅 Bookings</h3>
            <h2>{stats.total_bookings}</h2>
          </div>

          <div
            style={{
              border: "1px solid darkgreen",
              padding: "20px",
              borderRadius: "10px",
              width: "180px",
            }}
          >
            <h3>✅ Completed</h3>
            <h2>{stats.completed_bookings}</h2>
          </div>

          <div
            style={{
              border: "1px solid brown",
              padding: "20px",
              borderRadius: "10px",
              width: "180px",
            }}
          >
            <h3>⭐ Reviews</h3>
            <h2>{stats.total_reviews}</h2>
          </div>
        </div>
      )}

      {/* =====================================
          SEARCH
      ====================================== */}

      <input
        type="text"
        placeholder="Search Worker or CNIC..."
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

      {/* =====================================
          PENDING VERIFICATIONS
      ====================================== */}

      <h2>Pending Worker Verifications</h2>

      {workers.length === 0 ? (
        <h3>No Pending Verifications</h3>
      ) : filteredWorkers.length === 0 ? (
        <h3>No worker found for "{search}"</h3>
      ) : (
        filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            style={{
              border: "1px solid gray",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          >
            {/* Worker Information */}

            <h3>👷 {worker.worker_name}</h3>

            <p>
              <b>Worker ID:</b> {worker.worker_id}
            </p>

            <p>
              <b>Country:</b> {worker.country}
            </p>

            <p>
              <b>Document Type:</b> {worker.document_type}
            </p>

            <p>
              <b>Document Number:</b> {worker.document_number}
            </p>

            <p>
              <b>Status:</b> {worker.status}
            </p>

            {/* =================================
                DOCUMENT FRONT
            ================================= */}

            <h4>📄 Document Front</h4>

            {worker.document_front ? (
              <img
                src={worker.document_front}
                alt="Document Front"
                width="300"
                style={{
                  display: "block",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            ) : (
              <p>⚠️ Document Front not uploaded</p>
            )}

            {/* =================================
                DOCUMENT BACK
            ================================= */}

            <h4>📄 Document Back</h4>

            {worker.document_back ? (
              <img
                src={worker.document_back}
                alt="Document Back"
                width="300"
                style={{
                  display: "block",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            ) : (
              <p>⚠️ Document Back not uploaded</p>
            )}

            {/* =================================
                SELFIE
            ================================= */}

            <h4>🤳 Selfie</h4>

            {worker.selfie ? (
              <img
                src={worker.selfie}
                alt="Worker Selfie"
                width="250"
                style={{
                  display: "block",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            ) : (
              <p>⚠️ Selfie not uploaded</p>
            )}

            {/* =================================
                APPROVE
            ================================= */}

            <button
              onClick={() => verifyWorker(worker.worker_id, "approve")}
            >
              ✅ Approve
            </button>

            {/* =================================
                REJECT
            ================================= */}

            <button
              style={{ marginLeft: "10px" }}
              onClick={() => verifyWorker(worker.worker_id, "reject")}
            >
              ❌ Reject
            </button>

            {/* =================================
                VIEW PROFILE
            ================================= */}

            <br />
            <br />

            <button
              onClick={() => navigate(`/worker/${worker.worker_id}`)}
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