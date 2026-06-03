import { Navigate, useLocation } from "react-router-dom";

// This code was developed with assistance from ChatGPT (GPT-5.5, 2026).
// Prompt: "Create a React protected route component using React Router and JWT authentication."
// The generated example was reviewed, modified, and integrated into the UniSwap project.
// Check local storage for the token and user data needed by protected pages.
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

// ProtectedRoute redirects visitors without a saved session back to login.
function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!hasValidSession()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
