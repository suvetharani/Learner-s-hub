import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  // ================= VALIDATION =================
  const validate = () => {
    let err = {};

    if (!form.email) err.email = "Email is required";
    if (!form.password) err.password = "Password is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ================= SUBMIT =================
const submit = async () => {
  if (!validate()) return;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ Store token
    localStorage.setItem("token", data.token);

    // ✅ Store role (make sure backend sends it)
    localStorage.setItem("role", data.user.role);

    // ✅ Store userId (VERY IMPORTANT for profile)
    localStorage.setItem("userId", data.user._id);

    // Role-based navigation
    if (data.user.role === "admin") {
      navigate("/instructor");
    } else {
      navigate("/student");
    }

  } catch (err) {
    console.log(err);
    alert("Server error");
  }
};

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Please sign in to continue</div>

        {/* EMAIL FIELD */}
        <div className="input-group">
          <FaEnvelope />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>
        {errors.email && <div className="error-text">{errors.email}</div>}

        {/* PASSWORD FIELD */}
        <div className="input-group">
          <FaLock />
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          {show ? (
            <FaEyeSlash
              onClick={() => setShow(false)}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <FaEye
              onClick={() => setShow(true)}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        {errors.password && (
          <div className="error-text">{errors.password}</div>
        )}

        <button className="auth-btn" onClick={submit}>
          Sign In
        </button>

        <div className="switch-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;