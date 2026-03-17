import { useState } from "react";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(user.name);
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");

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
        name,
        university,
        password
      })
    });

    alert("Profile updated");
  };

  return (
    <div>
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

      <input
        type="password"
        placeholder="New Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleUpdate}>Update Profile</button>

      <br /><br />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;