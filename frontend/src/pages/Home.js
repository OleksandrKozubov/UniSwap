import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";

const handleLogout = () => {
  localStorage.removeItem("token");
  alert("Logged out");
};

const token = localStorage.getItem("token");

function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/listings")
      .then(res => res.json())
      .then(data => setListings(data));
  }, []);

  return (
    <div>
      <h1>UniSwap Marketplace</h1>
      <button onClick={handleLogout}>Logout</button>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

export default Home;