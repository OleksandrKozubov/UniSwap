import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

// Login collects credentials, sends them to the backend, and redirects on success.
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search}`
    : "/home";

  useEffect(() => {
    const token = localStorage.getItem("token");
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      localStorage.removeItem("user");
    }

    if (token && user?.id) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async event => {
    event.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell app-shell--center">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="brand-lockup">
          <BrandLogo />
          <div>
            <p className="eyebrow">UniSwap</p>
            <h1 className="auth-title" id="login-title">Welcome back</h1>
          </div>
        </div>

        <form className="form-stack" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
