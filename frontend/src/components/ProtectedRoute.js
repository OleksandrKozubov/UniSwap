import { Navigate, useLocation } from "react-router-dom";

function hasValidSession() {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
  }

  return Boolean(token && user?.id);
}

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!hasValidSession()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
