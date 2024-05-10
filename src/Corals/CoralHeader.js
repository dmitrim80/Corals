import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./Firebase-config";

const CoralHeader = ({ user, onToggleDarkMode }) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      navigate("/corals/homepage");
    } catch (error) {
      setError("Login error: " + error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/corals/index");
    } catch (error) {
      setError("Sign out error: " + error.message);
    }
  };

  return (
    <div className="header">
      {user ? (
        <>
          <button className="page-btn-upload" onClick={handleLogout}>
            Logout
          </button>
          <span>{user.email}</span>
        </>
      ) : (
        <>
          <label className="header-login-input">
            Email:
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
            />
          </label>
          
          <label className="header-login-input">
            Password:
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
            />
          </label>
          <div>
            <button className="header-page-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button
              className="header-page-btn"
              onClick={() => navigate("/corals/signup")}
            >
              Sign Up
            </button>
          </div>
          
        </>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
export default CoralHeader;
