import { useNavigate } from "react-router-dom";
import {
  getListingImageUrls,
  listingPlaceholderImage
} from "../utils/listingImages";
import { getAvatarPlaceholder } from "../utils/avatar";
import { formatPrice } from "../utils/formatPrice";
import { formatListingDate } from "../utils/formatListingDate";

// ListingCard shows a quick preview and links to the full listing page.
function ListingCard({ listing, isOwner }) {
  const navigate = useNavigate();
  const imageUrls = getListingImageUrls(listing);
  const firstImage = imageUrls[0] || listingPlaceholderImage;
  const photoCount = imageUrls.length;
  const listedAt = formatListingDate(listing.created_at);
  const category = listing.category_name || "Uncategorized";
  const sellerName = listing.seller_name || "User";
  const sellerAvatar =
    listing.seller_avatar_url || getAvatarPlaceholder(sellerName);
  const openListing = () => navigate(`/listing/${listing.id}`);
  const handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openListing();
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
          <span className="link">Open listing</span>
          {listedAt && <span>{listedAt}</span>}
        </div>
      </div>
    </article>
  );
}

export default ListingCard;
