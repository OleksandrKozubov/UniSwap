import { useState } from "react";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(user.name);
  const [university, setUniversity] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleUpdate = async () => {
    await fetch("http://localhost:5001/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        name,
        university
      })
    });

    alert("Profile updated");
  };

  return (
    <div style={pageStyle}>
        <button onClick={() => window.location.href = "/home"}>
  Back
</button>
      <h2>Profile</h2>

      <p>Email: {user.email}</p>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
      />

      <input
        value={university}
        onChange={e => setUniversity(e.target.value)}
        placeholder="University"
      />

      <button onClick={handleUpdate}>Update Profile</button>
      <button onClick={() => window.location.href = "/change-password"}>
        Change Password
      </button>

      <br /><br />

      <button onClick={handleLogout}>Logout</button>
      <p style={{
        marginTop: "40px",
        fontSize: "12px",
        opacity: 0.5
      }}>
        ID: {user.id}
      </p>
    </div>
  );
}

export default Profile;
