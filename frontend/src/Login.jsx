import React from "react";
import "xp.css/dist/XP.css";
import "./Login.css";
import loginLogo from "./assets/mytuneslogo.png";

function Login() {
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
          <input type="text" placeholder="Username" />
          <label htmlFor="password">Password:</label>
          <input type="password" placeholder="Password" />
          <button>Login</button>
          <p>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
