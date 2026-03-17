import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    university: "",
    password: ""
  });

  const handleSubmit = async () => {
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
    <div>
      <h2>Register</h2>

      <input placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input placeholder="Name"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input placeholder="University"
        onChange={e => setForm({ ...form, university: e.target.value })}
      />

      <input type="password" placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}

export default Register;