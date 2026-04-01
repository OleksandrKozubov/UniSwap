import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

// const handleLogout = () => {
//   localStorage.removeItem("token");
//   alert("Logged out");
// };

const token = localStorage.getItem("token");

function Home() {
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/listings")
      .then(res => res.json())
      .then(data => setListings(data));
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  return (
    <div style={pageStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
     <h1>UniSwap Marketplace</h1>

  <div
    style={{ cursor: "pointer" }}
    onClick={() => window.location.href = "/profile"}
  >
    Welcome, {user?.name}
  </div>
   </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      <button
  onClick={() => window.location.href = "/create"}
  style={{
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "15px 25px",
    fontSize: "16px",
    borderRadius: "30px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
  }}
>
  + Create Listing
</button>
    </div>
  );
}

export default Home;
