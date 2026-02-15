import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaIdCard } from "react-icons/fa";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let err = {};
    if (!form.email) err.email = "Email is required";
    if (!form.password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    alert("Login success (backend later)");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Please sign in to continue</div>

        <div className="input-group">
          <FaIdCard />
          <input
            placeholder="Roll Number"
            value={form.roll}
            onChange={(e) => setForm({ ...form, roll: e.target.value })}
          />
        </div>
        {errors.email && <div className="error-text">{errors.email}</div>}

        <div className="input-group">
          <FaLock />
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {show ? (
            <FaEyeSlash onClick={() => setShow(false)} style={{ cursor: "pointer" }} />
          ) : (
            <FaEye onClick={() => setShow(true)} style={{ cursor: "pointer" }} />
          )}
        </div>
        {errors.password && <div className="error-text">{errors.password}</div>}

        <button className="auth-btn" onClick={submit}>
          Sign In
        </button>

        <div className="switch-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
