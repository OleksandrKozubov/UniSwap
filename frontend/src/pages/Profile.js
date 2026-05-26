import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarPlaceholder, getAvatarUrl } from "../utils/avatar";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    if (!user?.id) {
      navigate("/");
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
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, [navigate, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user?.id) {
    return <div className="loading-state">Loading profile...</div>;
  }

  const avatarUrl = getAvatarUrl(user, user.name);

  return (
    <main className="app-shell">
      <div className="app-container app-container--narrow">
        <header className="page-header">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="page-title">Profile</h1>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/home")}>
            Back
          </button>
        </header>

        <section className="content-panel">
          <div className="profile-header">
            <img
              className="avatar avatar-lg"
              src={avatarUrl}
              alt={user.name || "User"}
              onError={event => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getAvatarPlaceholder(user.name);
              }}
            />
            <div>
              <h2 className="profile-name">{user.name}</h2>
              <p className="page-subtitle">{user.university}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <span className="meta-label">Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="profile-detail">
              <span className="meta-label">Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="profile-detail">
              <span className="meta-label">University</span>
              <strong>{user.university}</strong>
            </div>
            <div className="profile-detail">
              <span className="meta-label">ID</span>
              <strong>{user.id}</strong>
            </div>
          </div>

          <div className="page-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate("/edit-profile")}
            >
              Edit profile
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/change-password")}
            >
              Change password
            </button>
            <button className="btn btn-danger" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;
