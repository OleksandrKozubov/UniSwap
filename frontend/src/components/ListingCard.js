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

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      margin: "10px",
      width: "200px",
      position: "relative"
    }}>
      {isOwner && (
        <span style={{
          display: "inline-block",
          marginBottom: "8px",
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
