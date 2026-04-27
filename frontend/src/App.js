import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

// App maps each route to the page component for that part of the marketplace flow.
function App() {
  return (
    <Router>
      {/* Each route renders a full page inside the single-page app. */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/listing/:id/edit" element={<EditListing />} />
        <Route path="/chat/:listingId/:receiverId" element={<Chat />} />
        <Route path="/chats" element={<Chats />} />
      </Routes>
    </Router>
  );
}

export default App;