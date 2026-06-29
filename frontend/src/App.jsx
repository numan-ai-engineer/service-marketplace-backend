import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./pages/Home";
import Services from "./pages/Services";
import MyBookings from "./pages/MyBookings";
import WorkerDashboard from "./pages/WorkerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
       <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>}/>
        <Route
  path="/my-bookings" element={<ProtectedRoute role="customer"><MyBookings /></ProtectedRoute>}/>
        <Route
  path="/worker-dashboard"
  element={
    <ProtectedRoute role="worker">
      <WorkerDashboard />
    </ProtectedRoute>
  }
/>
      </Routes>
    </>
  );
}

export default App;