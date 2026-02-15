import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaIdCard } from "react-icons/fa";
import "../styles/auth.css";

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");

  const [form, setForm] = useState({
    name: "",
    email: "",
    roll: "",
    password: "",
    adminSecret: "",
    degree: "",
    specialization: "",
    experience: "",
    bio: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let err = {};

    if (!form.name) err.name = "Name is required";
    if (!form.email) err.email = "Email is required";

    if (role === "student") {
      if (!form.roll) err.roll = "Roll number is required";
      else if (!form.roll.includes("IMT"))
        err.roll = "Roll number must contain IMT";
    }

    if (!form.password) err.password = "Password is required";

    if (role === "admin") {
      if (!form.adminSecret) err.adminSecret = "Admin secret is required";
      if (!form.degree) err.degree = "Degree is required";
      if (!form.specialization)
        err.specialization = "Specialization is required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    console.log(form); // later send to backend
    alert("Signup success (backend later)");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Register to get started</div>

        {/* role */}
        <div className="role-container">
          <div
            className={`role-box ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            Student
          </div>
          <div
            className={`role-box ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            Admin
          </div>
        </div>

        {/* name */}
        <div className="input-group">
          <FaUser />
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        {errors.name && <div className="error-text">{errors.name}</div>}

        {/* email */}
        <div className="input-group">
          <FaEnvelope />
          <input
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        {errors.email && <div className="error-text">{errors.email}</div>}

        {/* roll */}
        {role === "student" && (
          <>
            <div className="input-group">
              <FaIdCard />
              <input
                placeholder="Roll Number"
                value={form.roll}
                onChange={(e) => setForm({ ...form, roll: e.target.value })}
              />
            </div>
            {errors.roll && <div className="error-text">{errors.roll}</div>}
          </>
        )}

        {/* password */}
        <div className="input-group">
          <FaLock />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {errors.password && <div className="error-text">{errors.password}</div>}

        {/* admin secret */}
        {role === "admin" && (
          <>
            <div className="input-group">
              <FaLock />
              <input
                placeholder="Admin secret key"
                value={form.adminSecret}
                onChange={(e) =>
                  setForm({ ...form, adminSecret: e.target.value })
                }
              />
            </div>
            {errors.adminSecret && (
              <div className="error-text">{errors.adminSecret}</div>
            )}

            {/* instructor details */}
            <div className="input-group">
              <FaIdCard />
              <input
                placeholder="Highest Degree (e.g., M.Tech, PhD)"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
              />
            </div>
            {errors.degree && (
              <div className="error-text">{errors.degree}</div>
            )}

            <div className="input-group">
              <FaUser />
              <input
                placeholder="Specialization (e.g., AI, Web Dev)"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
              />
            </div>
            {errors.specialization && (
              <div className="error-text">{errors.specialization}</div>
            )}

            <div className="input-group">
              <FaUser />
              <input
                placeholder="Experience in years"
                value={form.experience}
                onChange={(e) =>
                  setForm({ ...form, experience: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <FaUser />
              <input
                placeholder="Short Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </>
        )}

        <button className="auth-btn" onClick={submit}>
          Sign Up
        </button>

        <div className="switch-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
