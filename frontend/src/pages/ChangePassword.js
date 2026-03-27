import { useState } from "react";

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  gap: "12px"
};

const inputStyle = {
  width: "260px",
  padding: "10px"
};

function ChangePassword() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

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
    window.location.href = "/profile";
  };

  return (
    <div style={pageStyle}>
      <h2>Change Password</h2>

      <input
        style={inputStyle}
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>Save Password</button>
      <button onClick={() => window.location.href = "/profile"}>Back</button>
    </div>
  );
}

export default ChangePassword;
