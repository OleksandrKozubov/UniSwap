import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

function EditListing() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Load existing listing
  useEffect(() => {
    fetch(`http://localhost:5001/listings/${id}`)
      .then(res => res.json())
      .then(data => {
        // 🔒 Protect: only owner can edit
        if (data.user_id !== user.id) {
          alert("Not allowed");
          window.location.href = "/home";
          return;
        }

        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
      });
  }, [id]);

  // Update listing
  const handleUpdate = async () => {
    if (!title || !price) {
      alert("Title and price required");
      return;
    }

    const res = await fetch(`http://localhost:5001/listings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        price,
        userId: user.id
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("Updated!");
    window.location.href = `/listing/${id}`;
  };

  return (
    <div style={pageStyle}>
      <h2>Edit Listing</h2>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
      />

      <input
        value={price}
        onChange={e => setPrice(e.target.value)}
        placeholder="Price"
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
      />

      <button onClick={handleUpdate}>Save</button>
      <button onClick={() => window.location.href = `/listing/${id}`}>
        Cancel
      </button>
    </div>
  );
}

export default EditListing;