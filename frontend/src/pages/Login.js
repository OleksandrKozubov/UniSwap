import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
    <div>
      <h2>Login</h2>

      <input placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input type="password" placeholder="Password"
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