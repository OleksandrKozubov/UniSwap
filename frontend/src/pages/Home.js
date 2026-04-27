import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import locations from "../data/locations";

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

// Home loads all listings and greets the signed-in user from local storage.
function Home() {
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    params.append("sort", sortBy);

    fetch(`http://localhost:5001/listings?${params.toString()}`)
      .then(res => res.json())
      .then(data => setListings(data));
  }, [search, category, location, minPrice, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

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
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Furniture">Furniture</option>
        </select>

        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </select>

        <button onClick={resetFilters}>Reset Filters</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {listings.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isOwner={user?.id === listing.user_id}
          />
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
