import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import locations from "../data/locations";

// CreateListing gathers the listing fields and posts a new item for the current user.
function CreateListing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5001/categories")
      .then(res => res.json())
      .then(data =>
        setCategories(
          Array.isArray(data)
            ? [...data].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
              )
            : []
        )
      )
      .catch(error => {
        console.error(error);
        setCategories([]);
      });
  }, [navigate, user?.id]);

  const handleSubmit = async event => {
    event.preventDefault();

    if (!title || price === "") {
      alert("Title and price required");
      return;
    }

    if (!user?.id) {
      alert("Please log in again");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = [];

      if (images.length > 0) {
        for (const file of images) {
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
          categoryId,
          imageUrls
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Listing could not be created");
        return;
      }

      alert("Listing created!");
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="app-container app-container--narrow">
        <header className="page-header">
          <div>
            <p className="eyebrow">New listing</p>
            <h1 className="page-title">Create listing</h1>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
        </header>

        <form className="content-panel form-grid" onSubmit={handleSubmit}>
          <div className="field form-row-full">
            <label htmlFor="listing-title">Title</label>
            <input
              id="listing-title"
              className="input"
              placeholder="Desk lamp, course book, bike..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="listing-price">Price</label>
            <div className="input-action-row">
              <input
                id="listing-price"
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="25"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setPrice("0")}
              >
                Free
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="listing-category">Category</label>
            <select
              id="listing-category"
              className="select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field form-row-full">
            <label htmlFor="listing-description">Description</label>
            <textarea
              id="listing-description"
              className="textarea"
              placeholder="Condition, pickup details, and anything useful."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="listing-images">Images</label>
            <input
              id="listing-images"
              className="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={e => setImages(Array.from(e.target.files || []))}
            />
          </div>

          <div className="field">
            <label htmlFor="listing-location">Location</label>
            <select
              id="listing-location"
              className="select"
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
          </div>

          <div className="page-actions form-row-full">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/home")}
            >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateListing;
