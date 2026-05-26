import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { getAvatarPlaceholder } from "../utils/avatar";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (error) {
    return (
      <main className="app-shell">
        <div className="app-container">
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
          <section className="empty-state">
            <h3>{error}</h3>
            <p>The profile could not be opened.</p>
          </section>
        </div>
      </main>
    );
  }

  if (!user) {
    return <div className="loading-state">Loading profile...</div>;
  }

  const avatarUrl = user.avatar_url || getAvatarPlaceholder(user.name);

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="page-header">
          <div className="profile-header">
            <img
              className="avatar avatar-lg"
              src={avatarUrl}
              alt={user.name || "User"}
              onError={event => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getAvatarPlaceholder(user.name);
              }}
            />

            <div>
              <p className="eyebrow">Seller profile</p>
              <h1 className="page-title">{user.name}</h1>
              <p className="page-subtitle">{user.university}</p>
            </div>
          </div>

          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
        </header>

        <section aria-label="Seller listings">
          <h2 className="section-title">Listings</h2>
          {listings.length === 0 ? (
            <div className="empty-state">
              <h3>No listings yet</h3>
              <p>This seller has not posted anything visible right now.</p>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default UserProfile;
