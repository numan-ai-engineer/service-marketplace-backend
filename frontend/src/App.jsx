import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./pages/Home";
import Services from "./pages/Services";
import MyBookings from "./pages/MyBookings";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services" element={<Services />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </>
  );
}

export default App;