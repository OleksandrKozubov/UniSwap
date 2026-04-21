import { Link } from "react-router-dom";

// ListingCard shows a quick preview and links to the full listing page.
function ListingCard({ listing, isOwner }) {
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

      <h3>{listing.title}</h3>
      <p>${listing.price}</p>

      <Link to={`/listing/${listing.id}`}>
        View Details
      </Link>
    </div>
  );
}

export default ListingCard;
