import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import locations from "../data/locations";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

// EditListing preloads an existing listing and saves owner-approved changes.
function EditListing() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Load the current listing values before showing the edit form.
  useEffect(() => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    fetch(`http://localhost:5001/listings/${id}`)
      .then(res => res.json())
      .then(data => {
        // Redirect away if someone other than the owner opens this page.
        if (data.user_id !== userId) {
          alert("Not allowed");
          window.location.href = "/home";
          return;
        }

        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
        setSelectedLocation(data.location || "");
        setExistingImages(data.images || []);
      });
  }, [id, userId]);

  // Save the edited fields back to the backend.
  const handleUpdate = async () => {
    if (!title || !price) {
      alert("Title and price required");
      return;
    }

    let imageUrls = [];

    if (newImages.length > 0) {
      for (let file of newImages) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadRes = await fetch("http://localhost:5001/upload", {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          alert(uploadData.error || "Image upload failed");
          return;
        }

        imageUrls.push(uploadData.imageUrl);
      }
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
        location: selectedLocation,
        imageUrls,
        userId
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
       <button onClick={() => window.location.href = "/home"}>
        Back
      </button>
      <h2>Edit Listing</h2>

      <h3>Current Images</h3>

<div style={{ display: "flex", gap: "10px" }}>
  {existingImages.map(img => (
    <div key={img.id || img.image_url}>
      <img
        src={img.image_url}
        alt={title}
        style={{ width: "100px", height: "80px" }}
      />

      <button
        onClick={async () => {
          const res = await fetch(`http://localhost:5001/listings/${id}/images`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId,
              imageId: img.id,
              imageUrl: img.image_url
            })
          });

          if (!res.ok) {
            const data = await res.json();
            alert(data.error || "Image delete failed");
            return;
          }

          setExistingImages(prev =>
            prev.filter(image =>
              image.id !== img.id && image.image_url !== img.image_url
            )
          );
        }}
      >
        Delete
      </button>
    </div>
  ))}
</div>

<h3>Add New Images</h3>

<input
  type="file"
  multiple
  onChange={e => setNewImages(Array.from(e.target.files || []))}
/>

<select
  value={selectedLocation}
  onChange={e => setSelectedLocation(e.target.value)}
>
  <option value="">Select location</option>
  {locations.map(loc => (
    <option key={loc.name} value={loc.name}>
      {loc.name} ({loc.city})
    </option>
  ))}
</select>

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
