import { useState } from "react";

function CreateListing() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const pageStyle = {
    minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
  };
  
  const handleSubmit = async () => {
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
        userId: user.id
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

      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}

export default CreateListing;