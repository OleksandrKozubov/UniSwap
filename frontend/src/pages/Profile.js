const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

function Profile() {

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div style={pageStyle}>

      <button onClick={() => window.location.href = "/home"}>
        Back
      </button>

      <h2>Profile</h2>

      <img
        src={user.avatar_url || "https://via.placeholder.com/100"}
        alt="avatar"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />

      <p>Email: {user.email}</p>

      <p>Name: {user.name}</p>

      <p>University: {user.university}</p>

      <button onClick={() => window.location.href = "/edit-profile"}>
        Edit Profile
      </button>

      <button onClick={() => window.location.href = "/change-password"}>
        Change Password
      </button>

      <br /><br />

      <button onClick={handleLogout}>
        Logout
      </button>

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
