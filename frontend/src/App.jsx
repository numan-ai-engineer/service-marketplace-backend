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
import WorkerProfile from "./pages/WorkerProfile";
import CustomerDashboard from "./pages/CustomerDashboard";
import Notifications from "./pages/Notifications";

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
       <Route path="/worker/:id" element={<WorkerProfile />} />
       <Route path="/customer-dashboard" element={<CustomerDashboard />} />
       <Route path="/notifications" element={<Notifications />} />

      </Routes>
    </>
  );
}

export default App;