import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";

// SavedListings loads and displays the current user's saved marketplace items.
function SavedListings() {
  const navigate = useNavigate();
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();

    fetch(`http://localhost:5001/users/${user.id}/saved-listings`, {
      signal: controller.signal
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Saved listings could not be loaded.");
        }

        return data;
      })
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error(error);
          setLoadError(error.message);
          setListings([]);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [navigate, user?.id]);

  const handleListingSavedChange = ({ listingId, isSaved, savedCount }) => {
    setListings(prevListings => {
      if (!isSaved) {
        return prevListings.filter(listing => listing.id !== listingId);
      }

      return prevListings.map(listing =>
        listing.id === listingId
          ? {
              ...listing,
              is_saved: isSaved,
              saved_count: savedCount
            }
          : listing
      );
    });
  };

  if (!user?.id) {
    return <div className="loading-state">Loading saved listings...</div>;
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="page-header">
          <div>
            <p className="eyebrow">Saved</p>
            <h1 className="page-title">Saved listings</h1>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
        </header>

        {isLoading && (
          <section className="empty-state" aria-live="polite">
            <h3>Loading saved listings...</h3>
          </section>
        )}

        {!isLoading && loadError && (
          <section className="empty-state" aria-live="polite">
            <h3>{loadError}</h3>
          </section>
        )}

        {!isLoading && !loadError && listings.length === 0 && (
          <section className="empty-state">
            <h3>No saved listings yet</h3>
          </section>
        )}

        {!isLoading && !loadError && listings.length > 0 && (
          <section className="listing-grid" aria-label="Saved listings">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={user.id === listing.user_id}
                currentUserId={user.id}
                onSavedChange={handleListingSavedChange}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default SavedListings;
