import { useState } from "react";
import locations from "../data/locations";

// CreateListing gathers the listing fields and posts a new item for the current user.
function CreateListing() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);

  const pageStyle = {
    minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
  };
  
  const handleSubmit = async () => {
    // Require the minimum fields before attempting to create the listing.
    let imageUrl = "";

    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      const uploadRes = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData
      });

  const uploadData = await uploadRes.json();
  imageUrl = uploadData.imageUrl;
}
    if (!title || !price) {
      alert("Title and price required");
      return;
    }
  
    const res = await fetch("http://localhost:5001/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        price,
        userId: user.id,
        location,
        imageUrl
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Listing created!");
    window.location.href = "/home";
  };

  return (
    <div style={pageStyle}>
      <button onClick={() => window.location.href = "/home"}>
  Back
</button>
      <h2>Create Listing</h2>

      <input placeholder="Title" onChange={e => setTitle(e.target.value)} />
      <input placeholder="Price" onChange={e => setPrice(e.target.value)} />
      <textarea placeholder="Description" onChange={e => setDescription(e.target.value)} />
      <input
  type="file"
  onChange={e => setImage(e.target.files[0])}
/>
        <select
  value={location}
  onChange={e => setLocation(e.target.value)}
>
  <option value="">Select location</option>
  {locations.map(loc => (
    <option key={loc.name} value={loc.name}>
      {loc.name} ({loc.city})
    </option>
  ))}
</select>

      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}

export default CreateListing;
