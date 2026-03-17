import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/create" element={<CreateListing />} />
      </Routes>
    </Router>
  );
}

export default App;