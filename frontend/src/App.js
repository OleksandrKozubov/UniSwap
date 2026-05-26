import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import "./App.css";

import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import EditListing from "./pages/EditListing";
import Chat from "./pages/Chat";
import Chats from "./pages/Chats";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/UserProfile";
import SavedListings from "./pages/SavedListings";

// App maps each route to the page component for that part of the marketplace flow.
function App() {
  const protect = page => <ProtectedRoute>{page}</ProtectedRoute>;

  return (
    <Router>
      {/* Each route renders a full page inside the single-page app. */}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={protect(<Home />)} />
        <Route path="/listing/:id" element={protect(<ListingDetails />)} />
        <Route path="/create" element={protect(<CreateListing />)} />
        <Route path="/profile" element={protect(<Profile />)} />
        <Route path="/change-password" element={protect(<ChangePassword />)} />
        <Route path="/listing/:id/edit" element={protect(<EditListing />)} />
        <Route path="/chat/:listingId/:receiverId" element={protect(<Chat />)} />
        <Route path="/chats" element={protect(<Chats />)} />
        <Route path="/saved" element={protect(<SavedListings />)} />
        <Route path="/edit-profile" element={protect(<EditProfile />)} />
        <Route path="/user/:id" element={protect(<UserProfile />)} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
