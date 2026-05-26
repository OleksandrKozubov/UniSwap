import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

// Register collects the required account fields before creating a new user.
function Register() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    university: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!form.email || !form.name || !form.university || !form.password) {
      alert("All fields are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("User registered!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell app-shell--center">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="brand-lockup">
          <BrandLogo />
          <div>
            <p className="eyebrow">Join UniSwap</p>
            <h1 className="auth-title" id="register-title">Create account</h1>
          </div>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="input"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={e => updateField("email", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              className="input"
              placeholder="Your name"
              value={form.name}
              onChange={e => updateField("name", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-university">University</label>
            <input
              id="register-university"
              className="input"
              placeholder="University"
              value={form.university}
              onChange={e => updateField("university", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="input"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={e => updateField("password", e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Register"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </button>
        </form>
      </section>
    </main>
  );
}

export default Register;
