import { Link } from "react-router-dom";

function ListingCard({ listing }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      margin: "10px",
      width: "200px"
    }}>
      <h3>{listing.title}</h3>
      <p>${listing.price}</p>

      <Link to={`/listing/${listing.id}`}>
        View Details
      </Link>
    </div>
  );
}

export default ListingCard;