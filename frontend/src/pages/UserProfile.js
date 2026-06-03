import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { getAvatarPlaceholder } from "../utils/avatar";

// UserProfile shows a seller profile together with that user's listings.
function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const listingParams = new URLSearchParams();

    if (currentUser?.id) {
      listingParams.append("userId", currentUser.id);
    }

    Promise.all([
      fetch(`http://localhost:5001/users/${id}`, {
        signal: controller.signal
      }).then(res => res.json()),
      fetch(`http://localhost:5001/users/${id}/listings?${listingParams.toString()}`, {
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
  }, [currentUser?.id, id]);

  const handleListingSavedChange = ({ listingId, isSaved, savedCount }) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.id === listingId
          ? {
              ...listing,
              is_saved: isSaved,
              saved_count: savedCount
            }
          : listing
      )
    );
  };

  if (error) {
    return (
      <main className="app-shell">
        <div className="app-container">
          <header className="page-header">
            <div>
              <p className="eyebrow">Seller profile</p>
              <h1 className="page-title">Profile unavailable</h1>
            </div>
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
              Back
            </button>
          </header>
          <section className="empty-state">
            <h3>{error}</h3>
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
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isOwner={currentUser?.id === listing.user_id}
                  currentUserId={currentUser?.id}
                  onSavedChange={handleListingSavedChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default UserProfile;
