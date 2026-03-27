import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

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