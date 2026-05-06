import { Link } from "react-router-dom";
import {
  getListingImageUrls,
  listingPlaceholderImage
} from "../utils/listingImages";
import { formatPrice } from "../utils/formatPrice";
import { formatListingDate } from "../utils/formatListingDate";

// ListingCard shows a quick preview and links to the full listing page.
function ListingCard({ listing, isOwner }) {
  const imageUrls = getListingImageUrls(listing);
  const firstImage = imageUrls[0] || listingPlaceholderImage;
  const photoCount = imageUrls.length;
  const listedAt = formatListingDate(listing.created_at);
  const category = listing.category_name || "Uncategorized";
  const sellerName = listing.seller_name || "User";
  const sellerAvatar =
    listing.seller_avatar_url || "https://via.placeholder.com/40";

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      margin: "10px",
      width: "200px",
      position: "relative"
    }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        <span style={{
          display: "inline-block",
          padding: "4px 8px",
          borderRadius: "999px",
          backgroundColor: "#4a6cb4",
          color: "#fff",
          fontSize: "12px",
          fontWeight: "bold"
        }}>
          {category}
        </span>
        {isOwner && (
        <span style={{
          display: "inline-block",
          padding: "4px 8px",
          borderRadius: "999px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          fontSize: "12px",
          fontWeight: "bold"
        }}>
          Your listing
        </span>
      )}
      </div>
      <div style={{ position: "relative" }}>
        <img
          src={firstImage}
          alt={listing.title}
          style={{ width: "100%", height: "150px", objectFit: "cover" }}
          onError={event => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = listingPlaceholderImage;
          }}
        />
        {photoCount > 0 && (
          <span style={{
            position: "absolute",
            right: "8px",
            bottom: "8px",
            padding: "3px 7px",
            borderRadius: "999px",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: "bold"
          }}>
            {photoCount} {photoCount === 1 ? "photo" : "photos"}
          </span>
        )}
      </div>
      <h3>{listing.title}</h3>
      <p>{formatPrice(listing.price)}</p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          marginBottom: "8px"
        }}
        onClick={() => window.location.href = `/user/${listing.user_id}`}
      >
        <img
          src={sellerAvatar}
          alt={sellerName}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            objectFit: "cover"
          }}
        />
        <span style={{ color: "lightblue", fontSize: "14px" }}>
          Seller: {sellerName}
        </span>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px"
      }}>
        <Link to={`/listing/${listing.id}`}>
          View Details
        </Link>
        {listedAt && (
          <span style={{
            fontSize: "11px",
            color: "#777",
            marginLeft: "auto",
            textAlign: "right"
          }}>
            {listedAt}
          </span>
        )}
      </div>
    </div>
  );
}

export default ListingCard;
