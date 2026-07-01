import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./pages/Home";
import Services from "./pages/Services";
import MyBookings from "./pages/MyBookings";
import WorkerDashboard from "./pages/WorkerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ServiceDetails from "./pages/ServiceDetails";
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>}/>
        <Route path="/my-bookings" element={<ProtectedRoute role="customer"><MyBookings /></ProtectedRoute>}/>
        <Route path="/worker-dashboard" element={<ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>}/>
       <Route path="/services/:id" element={<ServiceDetails />}/>
       <Route path="/profile" element={<Profile />} />
       <Route path="/booking/:id" element={<BookingDetails />}/>

      </Routes>
    </>
  );
}

export default App;