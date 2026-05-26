import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import locations from "../data/locations";
import { listingPlaceholderImage } from "../utils/listingImages";

// EditListing preloads an existing listing and saves owner-approved changes.
function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/categories")
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error(error);
        setCategories([]);
      });
  }, []);

  // Load the current listing values before showing the edit form.
  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    setIsLoading(true);

    fetch(`http://localhost:5001/listings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (Number(data.user_id) !== Number(userId)) {
          alert("Not allowed");
          navigate("/home");
          return;
        }

        setTitle(data.title || "");
        setPrice(data.price || "");
        setDescription(data.description || "");
        setSelectedLocation(data.location || "");
        setSelectedCategoryId(String(data.category_id || ""));
        setExistingImages(Array.isArray(data.images) ? data.images : []);
      })
      .catch(error => {
        console.error(error);
        alert("Listing could not be loaded");
        navigate("/home");
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate, userId]);

  const deleteImage = async img => {
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
  };

  // Save the edited fields back to the backend.
  const handleUpdate = async event => {
    event.preventDefault();

    if (!title || !price) {
      alert("Title and price required");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = [];

      if (newImages.length > 0) {
        for (const file of newImages) {
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
          categoryId: selectedCategoryId,
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
      navigate(`/listing/${id}`);
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading-state">Loading listing...</div>;
  }

  return (
    <main className="app-shell">
      <div className="app-container app-container--narrow">
        <header className="page-header">
          <div>
            <p className="eyebrow">Owner tools</p>
            <h1 className="page-title">Edit listing</h1>
            <p className="page-subtitle">
              Keep the listing accurate while preserving its existing audience.
            </p>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
        </header>

        <form className="content-panel form-grid" onSubmit={handleUpdate}>
          <div className="form-row-full">
            <h2 className="section-title">Current images</h2>
            {existingImages.length === 0 ? (
              <div className="empty-state">
                <h3>No images yet</h3>
                <p>Add new images below to improve the listing.</p>
              </div>
            ) : (
              <div className="image-grid">
                {existingImages.map(img => (
                  <div className="image-thumb" key={img.id || img.image_url}>
                    <img
                      src={img.image_url || listingPlaceholderImage}
                      alt={title}
                      onError={event => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = listingPlaceholderImage;
                      }}
                    />
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => deleteImage(img)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="field form-row-full">
            <label htmlFor="edit-images">Add new images</label>
            <input
              id="edit-images"
              className="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={e => setNewImages(Array.from(e.target.files || []))}
            />
          </div>

          <div className="field">
            <label htmlFor="edit-category">Category</label>
            <select
              id="edit-category"
              className="select"
              value={selectedCategoryId}
              onChange={e => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="edit-location">Location</label>
            <select
              id="edit-location"
              className="select"
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
          </div>

          <div className="field">
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
            />
          </div>

          <div className="field">
            <label htmlFor="edit-price">Price</label>
            <input
              id="edit-price"
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Price"
            />
          </div>

          <div className="field form-row-full">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              className="textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>

          <div className="page-actions form-row-full">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate(`/listing/${id}`)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditListing;
