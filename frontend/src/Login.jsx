import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "xp.css/dist/XP.css";
import "./Login.css";
import loginLogo from "./assets/mytuneslogo.png";

function Login({ setAccessToken, setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (username.trim() === "" || password.trim() === "") {
      alert("Please fill in all fields");
      return;
    }
    const response = await fetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: username.trim(),
        password: password,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.access_token);
      const profileRes = await fetch("http://localhost:8000/api/profile/", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (profileRes.ok) {
        setUser(await profileRes.json());
      } else {
        setUser({ id: data.user, username: username.trim() });
      }
      navigate("/");
    } else {
      alert("Failed to login");
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
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <p>
            Don't have an account?{" "}
            <a
              onClick={() => navigate("/signup")}
              style={{ cursor: "pointer" }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
