import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "xp.css/dist/XP.css";
import "./Login.css";
import loginLogo from "./assets/mytuneslogo.png";
import "./SignUp.css";
import { API_BASE_URL } from "./config.js";

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordRequirements({
      ...passwordRequirements,
      length: e.target.value.length >= 8,
      uppercase: e.target.value.match(/[A-Z]/),
      number: e.target.value.match(/[0-9]/),
      special: e.target.value.match(/[!@#$%^&*(),.?":{}|<>]/),
    });
  }

  const handleSignup = async () => {
    if (!username.trim() || !password || !confirmPassword.trim()) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password,
      }),
    });
    if (response.ok) {
      alert("User registered successfully");
      navigate("/login");
    } else {
      const data = await response.json();
      alert(data.error || "Failed to register user");
    }
  }

  return (
    <div className="login-container">
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">Welcome to MyTunes</div>
          <div className="title-bar-controls">
            <button aria-label="Help"></button>
          </div>
        </div>
        <div className="window-body">
          <div className="login-image">
            <img src={loginLogo} alt="MyTunes Logo" width={300} />
          </div>
          <label htmlFor="username">Username:</label>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="password">Password:</label>
          <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />

          <label htmlFor="confirm-password">Confirm Password:</label>
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <div className="password-requirements-container">
            <p className="password-requirements-title">Password must contain...</p>
            <ul className="password-requirements">
              <li key="length" className={passwordRequirements.length ? "requirement-satisfied" : "requirement-not-satisfied"}>At least 8 characters</li>
              <li key="uppercase" className={passwordRequirements.uppercase ? "requirement-satisfied" : "requirement-not-satisfied"}>At least one uppercase letter</li>
              <li key="number" className={passwordRequirements.number ? "requirement-satisfied" : "requirement-not-satisfied"}>At least one number</li>
              <li key="special" className={passwordRequirements.special ? "requirement-satisfied" : "requirement-not-satisfied"}>At least one special character</li>
            </ul>
          </div>
          <button disabled={!(passwordRequirements.length && passwordRequirements.uppercase && passwordRequirements.number && passwordRequirements.special)}
          onClick={handleSignup}>Sign up</button>
          <p>
            Already have an account? <a onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;