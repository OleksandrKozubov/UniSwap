import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarPlaceholder, getAvatarUrl } from "../utils/avatar";

// EditProfile lets the signed-in user update profile fields and avatar.
function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [name, setName] = useState(user?.name || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();

    fetch(`http://localhost:5001/users/${user.id}`, {
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Profile request failed");
        }

        return res.json();
      })
      .then(data => {
        setUser(prevUser => {
          const refreshedUser = { ...(prevUser || {}), ...data };
          localStorage.setItem("user", JSON.stringify(refreshedUser));
          return refreshedUser;
        });
        setName(data.name || "");
        setUniversity(data.university || "");
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, [navigate, user?.id]);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleUpdate = async event => {
    event.preventDefault();

    if (!user?.id) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl = user.avatar_url || user.avatarUrl || user.avatar || null;

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadRes = await fetch(
          "http://localhost:5001/upload-avatar",
          {
            method: "POST",
            body: formData
          }
        );

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          alert(uploadData.error || "Avatar upload failed");
          return;
        }

        avatarUrl = uploadData.imageUrl;
      }

      const res = await fetch(
        `http://localhost:5001/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            university,
            avatarUrl
          })
        }
      );

      const updatedUser = await res.json();

      if (!res.ok) {
        alert(updatedUser.error || "Profile update failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.id) {
    return <div className="loading-state">Loading profile...</div>;
  }

  const avatarUrl = previewUrl || getAvatarUrl(user, name || user.name);

  return (
    <main className="app-shell">
      <div className="app-container app-container--narrow">
        <header className="page-header">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="page-title">Edit profile</h1>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/profile")}>
            Back
          </button>
        </header>

        <form className="content-panel form-stack" onSubmit={handleUpdate}>
          <div className="profile-header">
            <img
              className="avatar avatar-lg"
              src={avatarUrl}
              alt={name || "User"}
              onError={event => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getAvatarPlaceholder(name);
              }}
            />
            <div className="field">
              <label htmlFor="profile-avatar">Avatar</label>
              <input
                id="profile-avatar"
                className="file-input"
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
            />
          </div>

          <div className="field">
            <label htmlFor="profile-university">University</label>
            <input
              id="profile-university"
              className="input"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              placeholder="University"
            />
          </div>

          <div className="page-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProfile;
