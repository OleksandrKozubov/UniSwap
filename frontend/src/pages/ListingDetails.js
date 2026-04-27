import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import locations from "../data/locations";
import Map from "../components/Map";
import {
  getListingImageUrls,
  listingPlaceholderImage
} from "../utils/listingImages";
import { formatPrice } from "../utils/formatPrice";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

// ListingDetails loads one listing and exposes owner-only actions like edit and delete.
function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) {
      return;
    }

    // The backend checks the userId before allowing a delete.
    const res = await fetch(`http://localhost:5001/listings/${listing.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: user.id })
    });

    if (res.ok) {
      alert("Deleted");
      window.location.href = "/home";
    } else {
      alert("Not allowed");
    }
  };

  useEffect(() => {
    fetch(`http://localhost:5001/listings/${id}`)
      .then(res => res.json())
      .then(data => setListing(data));
  }, [id]);

  if (!listing) return <p>Loading...</p>;

  const selectedLocation = locations.find(
    loc => loc.name === listing.location
  );
  const imageUrls = getListingImageUrls(listing);

  return (
    <div style={pageStyle}>
      <button onClick={() => window.location.href = "/home"}>
        Back
      </button>
      <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
        {(imageUrls.length > 0 ? imageUrls : [listingPlaceholderImage]).map(
          (imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={listing.title}
              style={{
                width: "400px",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px"
              }}
            />
          )
        )}
      </div>
      <h2>{listing.title}</h2>

      <h3>{formatPrice(listing.price)}</h3>

      <p>{listing.description}</p>

      <p>Category: {listing.category_name || "Uncategorized"}</p>

      <p>Location: {listing.location}</p>

      {selectedLocation && (
        <Map lat={selectedLocation.lat} lng={selectedLocation.lng} />
      )}

      {user?.id === listing.user_id && (
        <>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={() => window.location.href = `/listing/${listing.id}/edit`}>
            Edit
          </button>
        </>
      )}

      <p style={{
        marginTop: "40px",
        fontSize: "12px",
        opacity: 0.5
      }}>
        ID: {listing.id}
      </p>
    </div>
  );
}

export default ListingDetails;
