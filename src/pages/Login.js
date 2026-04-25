import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import "./Login.css";
import { BASE_URL } from "../config/api";
import cafeImg from "../assets/usg1.png";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.UserId);
        navigate("/home");
      } else {
        alert(data.message || "Invalid Username ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Server error ❌");
    }
  };

  return (
    <div className="login-page">
      {/* Decorative background elements */}
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>

      <div className="login-wrapper">

        <div className="login-external-brand">
          <div className="logo-wrapper">
            <img src={cafeImg} alt="Cafe" className="login-logo" />
          </div>
          <div className="brand-text-group">
            <h1 className="external-brand-name">Smart POS</h1>
            <p className="external-brand-subtitle">Backoffice System</p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Sign In</h2>
            <p className="login-card-subtitle">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label>USER ID</label>
              <div className="login-input-field">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label>PASSWORD</label>
              <div className="login-input-field">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

         <button type="submit" className="login-btn">
          <span className="icon-box">
            <FiLogIn />
          </span>
          Sign In
        </button>
          </form>

        </div>
      </div>
      <div className="footer-text">© 2026 Unipro Softwares SG Pte Ltd</div>
    </div>
  );
}

export default Login;
