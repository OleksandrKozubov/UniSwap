import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ChangePassword verifies the new password twice before sending the update request.
function ChangePassword() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate("/");
    }
  }, [navigate, user?.id]);

  const handleSubmit = async event => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5001/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          oldPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not change password");
        return;
      }

      alert("Password updated");
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

  return (
    <main className="app-shell app-shell--center">
      <section className="auth-card" aria-labelledby="change-password-title">
        <div className="brand-lockup">
          <span className="brand-mark">US</span>
          <div>
            <p className="eyebrow">Security</p>
            <h1 className="auth-title" id="change-password-title">
              Change password
            </h1>
            <p className="auth-copy">
              Update your password while keeping your current session clean.
            </p>
          </div>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="old-password">Old password</label>
            <input
              id="old-password"
              className="input"
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              className="input"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              className="input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save password"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/profile")}
          >
            Back
          </button>
        </form>
      </section>
    </main>
  );
}

export default ChangePassword;
