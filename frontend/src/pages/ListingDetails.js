import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

  return (
    <div style={pageStyle}>
        <button onClick={() => window.location.href = "/home"}>
  Back
</button>
      <h2>{listing.title}</h2>

      <h3>${listing.price}</h3>

      <p>{listing.description}</p>

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
