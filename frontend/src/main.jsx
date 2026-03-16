import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import { API_BASE_URL } from "./config.js";

function ProtectedRoute({ accessToken, loading, children }) {
  if (loading) return null;
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
}

function Root() {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("Access Token:", accessToken);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshRes = await fetch(
          `${API_BASE_URL}/api/auth/refresh/`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!refreshRes.ok) {
          setLoading(false);
          return;
        }

        const { access_token } = await refreshRes.json();
        setAccessToken(access_token);

        const profileRes = await fetch(`${API_BASE_URL}/api/profile/`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUser(profile);
        }
      } catch (e) {
        console.error("Bootstrap error:", e);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login setAccessToken={setAccessToken} setUser={setUser} />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute accessToken={accessToken} loading={loading}>
              <App
                accessToken={accessToken}
                setAccessToken={setAccessToken}
                user={user}
                setUser={setUser}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
    <Root />
);
