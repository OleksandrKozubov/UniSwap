import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    // store token
    localStorage.setItem("token", data.token);

    alert("Logged in!");
  };

  return (
    <div>
      <h2>Login</h2>

      <input placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input type="password" placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;