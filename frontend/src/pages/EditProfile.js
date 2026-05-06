import { useState } from "react";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#1a1a1a",
  color: "#f5f5f5",
  padding: "20px"
};

function EditProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(user.name || "");
  const [university, setUniversity] = useState(user.university || "");
  const [image, setImage] = useState(null);

  const handleUpdate = async () => {
    let avatarUrl = user.avatar_url;

    // Upload avatar if selected
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

    // Update profile
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

    // Update localStorage
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    alert("Profile updated");

    window.location.href = "/profile";
  };

  return (
    <div style={pageStyle}>

      <button onClick={() => window.location.href = "/profile"}>
        Back
      </button>

      <h2>Edit Profile</h2>
      <img
        src={
          image
            ? URL.createObjectURL(image)
            : user.avatar_url || "https://via.placeholder.com/100"
        }
        alt="avatar"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: "10px"
        }}
      />

      <br />

      <input
        type="file"
        onChange={e => setImage(e.target.files[0])}
      />

      <br /><br />

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
      />

      <br /><br />

      <input
        value={university}
        onChange={e => setUniversity(e.target.value)}
        placeholder="University"
      />

      <br /><br />

      <button onClick={handleUpdate}>
        Save Changes
      </button>

    </div>
  );
}

export default EditProfile;
