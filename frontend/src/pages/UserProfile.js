import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

function UserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch(`http://localhost:5001/users/${id}`, {
        signal: controller.signal
      }).then(res => res.json()),
      fetch(`http://localhost:5001/users/${id}/listings`, {
        signal: controller.signal
      }).then(res => res.json())
    ])
      .then(([userData, listingsData]) => {
        if (userData.error) {
          setError(userData.error);
          return;
        }

        setUser(userData);
        setListings(Array.isArray(listingsData) ? listingsData : []);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Load failed");
        }
      });

    return () => controller.abort();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div style={pageStyle}>

      <button onClick={() => window.location.href = "/home"}>
        Back
      </button>

      {/* PROFILE HEADER */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <img
          src={user.avatar_url || "https://via.placeholder.com/100"}
          alt={user.name || "User"}
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />

        <div>
          <h2>{user.name}</h2>
          <p>{user.university}</p>
        </div>
      </div>

      <h3 style={{ marginTop: "20px" }}>Listings</h3>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

    </div>
  );
}

export default UserProfile;
