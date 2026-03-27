import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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

  const handleLogin = async () => {
    if (!email || !password) {
  alert("Please enter email and password");
  return;
}
    const res = await fetch("http://localhost:5001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // store token
    localStorage.setItem("token", data.token);

    localStorage.setItem("token", data.token);

    navigate("/home")
  };

  return (
    <div style={pageStyle}>
      <h1>Uniswap</h1>

      <h3>Login</h3>

      <input
        style={inputStyle}
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={() => window.location.href = "/register"}>
  Register
</button>
    </div>
  );
}

export default Login;
