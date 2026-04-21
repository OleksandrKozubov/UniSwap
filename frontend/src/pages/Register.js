import { useState } from "react";

// Register collects the required account fields before creating a new user.
function Register() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    university: "",
    password: ""
  });

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

  const handleSubmit = async () => {
    // Keep the request from being sent with missing profile information.
    if (!form.email || !form.name || !form.university || !form.password) {
  alert("All fields are required");
  return;
}
    await fetch("http://localhost:5001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    alert("User registered!");
  };

  return (
    <div style={pageStyle}>
      <h2>Register</h2>

      <input
        style={inputStyle}
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        style={inputStyle}
        placeholder="Name"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        style={inputStyle}
        placeholder="University"
        onChange={e => setForm({ ...form, university: e.target.value })}
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={handleSubmit}>Register</button>
      <button onClick={() => window.location.href = "/"}>
  Already have an account? Login
</button>
    </div>
  );
}

export default Register;
