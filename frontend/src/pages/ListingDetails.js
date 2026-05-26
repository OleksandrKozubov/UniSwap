import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import locations from "../data/locations";
import Map from "../components/Map";
import {
  getListingImageUrls,
  listingPlaceholderImage
} from "../utils/listingImages";
import { getAvatarPlaceholder } from "../utils/avatar";
import { formatPrice } from "../utils/formatPrice";

// ListingDetails loads one listing and exposes owner-only actions like edit and delete.
function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loadError, setLoadError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleDelete = async () => {
    if (!user?.id) {
      alert("Please log in again");
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) {
      return;
    }

    const res = await fetch(`http://localhost:5001/listings/${listing.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: user.id })
    });

    if (res.ok) {
      alert("Deleted");
      navigate("/home");
    } else {
      alert("Not allowed");
    }
  };

  const contactSeller = () => {
    if (!user?.id) {
      alert("Please log in to contact the seller");
      navigate("/login");
      return;
    }

    navigate(`/chat/${listing.id}/${listing.user_id}`);
  };

  useEffect(() => {
    fetch(`http://localhost:5001/listings/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Listing request failed");
        }

        return res.json();
      })
      .then(data => setListing(data))
      .catch(error => {
        console.error(error);
        setLoadError("Listing could not be loaded.");
      });
  }, [id]);

  if (loadError) {
    return (
      <main className="app-shell">
        <div className="app-container">
          <header className="page-header">
            <div>
              <p className="eyebrow">Listing details</p>
              <h1 className="page-title">Listing unavailable</h1>
            </div>
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
              Back
            </button>
          </header>
          <section className="empty-state">
            <h3>{loadError}</h3>
          </section>
        </div>
      </main>
    );
  }

  if (!listing) {
    return <div className="loading-state">Loading listing...</div>;
  }

  const selectedLocation = locations.find(
    loc => loc.name === listing.location
  );
  const imageUrls = getListingImageUrls(listing);
  const sellerName = listing.seller_name || "User";
  const sellerAvatar =
    listing.seller_avatar_url || getAvatarPlaceholder(sellerName);
  const isOwner = user?.id === listing.user_id;

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="page-header">
          <div>
            <p className="eyebrow">Listing details</p>
            <h1 className="page-title">{listing.title}</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
              Back
            </button>
            <button className="btn btn-primary" type="button" onClick={contactSeller}>
              Contact seller
            </button>
            {isOwner && (
              <>
                <button className="btn btn-danger" type="button" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => navigate(`/listing/${listing.id}/edit`)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </header>

        <section className="detail-layout">
          <div>
            <div className="detail-gallery" aria-label="Listing images">
              {(imageUrls.length > 0 ? imageUrls : [listingPlaceholderImage]).map(
                (imageUrl, index) => (
                  <img
                    key={imageUrl + index}
                    src={imageUrl}
                    alt={listing.title}
                    onError={event => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = listingPlaceholderImage;
                    }}
                  />
                )
              )}
            </div>

            {selectedLocation && (
              <div className="mt-2">
                <Map lat={selectedLocation.lat} lng={selectedLocation.lng} />
              </div>
            )}
          </div>

          <aside className="detail-card">
            <div>
              <h2 className="detail-title">{listing.title}</h2>
              <p className="listing-price">{formatPrice(listing.price)}</p>
            </div>

            <p className="description">
              {listing.description || "No description provided."}
            </p>

            <button
              type="button"
              className="seller-row seller-button"
              onClick={() => navigate(`/user/${listing.user_id}`)}
            >
              <img
                className="avatar avatar-lg"
                src={sellerAvatar}
                alt={sellerName}
                onError={event => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getAvatarPlaceholder(sellerName);
                }}
              />
              <span>
                <span className="muted">Seller</span>
                <span className="seller-name">{sellerName}</span>
              </span>
            </button>

            <dl className="meta-list">
              <div className="meta-item">
                <dt className="meta-label">Category</dt>
                <dd className="meta-value">{listing.category_name || "Uncategorized"}</dd>
              </div>
              <div className="meta-item">
                <dt className="meta-label">Location</dt>
                <dd className="meta-value">{listing.location || "Not specified"}</dd>
              </div>
              <div className="meta-item">
                <dt className="meta-label">Listing ID</dt>
                <dd className="meta-value">{listing.id}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default ListingDetails;
