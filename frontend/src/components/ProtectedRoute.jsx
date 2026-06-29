import { Navigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function ProtectedRoute({ children, role }) {
  const { user } = useContext(UserContext);

  // User Login نہیں ہے
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // اگر مخصوص Role چاہیے
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;