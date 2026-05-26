import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getListingImageUrls,
  listingPlaceholderImage
} from "../utils/listingImages";
import { getAvatarPlaceholder } from "../utils/avatar";
import { formatPrice } from "../utils/formatPrice";
import { formatListingDate } from "../utils/formatListingDate";

function HeartIcon({ filled }) {
  return (
    <svg className="heart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 21s-7.5-4.7-9.6-9.1C.7 8.4 2.4 4.5 6.1 4.1c2-.2 3.8.8 4.9 2.3 1.1-1.5 2.9-2.5 4.9-2.3 3.7.4 5.4 4.3 3.7 7.8C19.5 16.3 12 21 12 21Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListingCard({ listing, isOwner, currentUserId, onSavedChange }) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const viewerId = Number(currentUserId || storedUser?.id);
  const imageUrls = getListingImageUrls(listing);
  const firstImage = imageUrls[0] || listingPlaceholderImage;
  const photoCount = imageUrls.length;
  const listedAt = formatListingDate(listing.created_at);
  const category = listing.category_name || "Uncategorized";
  const sellerName = listing.seller_name || "User";
  const sellerAvatar =
    listing.seller_avatar_url || getAvatarPlaceholder(sellerName);
  const [isSaved, setIsSaved] = useState(Boolean(listing.is_saved));
  const [saveCount, setSaveCount] = useState(Number(listing.saved_count) || 0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(Boolean(listing.is_saved));
    setSaveCount(Number(listing.saved_count) || 0);
  }, [listing.id, listing.is_saved, listing.saved_count]);

  const openListing = () => navigate(`/listing/${listing.id}`);
  const handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openListing();
    }
  };

  const toggleSaved = async event => {
    event.stopPropagation();

    if (!viewerId) {
      alert("Please log in to save listings");
      navigate("/login");
      return;
    }

    const nextSaved = !isSaved;
    const nextCount = Math.max(0, saveCount + (nextSaved ? 1 : -1));

    setIsSaving(true);
    setIsSaved(nextSaved);
    setSaveCount(nextCount);

    try {
      const res = await fetch(`http://localhost:5001/listings/${listing.id}/save`, {
        method: nextSaved ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: viewerId })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Save request failed");
      }

      const updatedSaved = Boolean(data.is_saved);
      const updatedCount = Number(data.saved_count) || 0;

      setIsSaved(updatedSaved);
      setSaveCount(updatedCount);
      onSavedChange?.({
        listingId: listing.id,
        isSaved: updatedSaved,
        savedCount: updatedCount
      });
    } catch (error) {
      console.error(error);
      setIsSaved(isSaved);
      setSaveCount(saveCount);
      alert(error.message || "Could not update saved listing");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article
      className="listing-card"
      role="link"
      tabIndex="0"
      aria-label={`Open ${listing.title}`}
      onClick={openListing}
      onKeyDown={handleKeyDown}
    >
      <div className="listing-card-media">
        <img
          src={firstImage}
          alt={listing.title}
          onError={event => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = listingPlaceholderImage;
          }}
        />
        {photoCount > 0 && (
          <span className="badge badge-dark photo-count">
            {photoCount} {photoCount === 1 ? "photo" : "photos"}
          </span>
        )}
        <button
          type="button"
          className={`save-button ${isSaved ? "save-button--active" : ""}`}
          aria-label={isSaved ? "Remove saved listing" : "Save listing"}
          aria-pressed={isSaved}
          disabled={isSaving}
          onClick={toggleSaved}
          onKeyDown={event => event.stopPropagation()}
        >
          <HeartIcon filled={isSaved} />
          <span>{saveCount}</span>
        </button>
      </div>

      <div className="listing-card-body">
        <div className="badge-row">
          <span className="badge badge-primary">{category}</span>
          {isOwner && (
            <span className="badge badge-success">Your listing</span>
          )}
        </div>

        <div>
          <h3 className="listing-title">{listing.title}</h3>
          <p className="listing-price">{formatPrice(listing.price)}</p>
        </div>

        <button
          type="button"
          className="seller-row seller-button"
          onClick={event => {
            event.stopPropagation();
            navigate(`/user/${listing.user_id}`);
          }}
          onKeyDown={event => event.stopPropagation()}
        >
          <img
            className="avatar"
            src={sellerAvatar}
            alt={sellerName}
            onError={event => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getAvatarPlaceholder(sellerName);
            }}
          />
          <span>
            <span className="muted">Seller</span>{" "}
            <span className="seller-name">{sellerName}</span>
          </span>
        </button>

        <div className="listing-card-footer">
          {listedAt && <span>{listedAt}</span>}
        </div>
      </div>
    </article>
  );
}

export default ListingCard;
