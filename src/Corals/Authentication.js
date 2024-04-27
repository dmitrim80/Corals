import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase-config";

function Authentication() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      console.log("User registered:", userCredential.user);
      setRegisterEmail("");
      setRegisterPassword("");
      setError("");
    } catch (error) {
      setError("Registration error: " + error.message);
    }
  };

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      console.log("User logged in:", userCredential.user);
      setLoginEmail("");
      setLoginPassword("");
      setError("");
    } catch (error) {
      setError("Login error: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out.");
    } catch (error) {
      setError("Sign out error: " + error.message);
    }
  };

  return (
    <div>
      <div>
        <h3>Register User</h3>
        <input
          placeholder="Email..."
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
        />
        <input
          placeholder="Password..."
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
        />
        <button onClick={register}>Create User</button>
      </div>
      <div>
        <h3>Login</h3>
        <input
          placeholder="Email..."
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          placeholder="Password..."
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h4>User Logged In: {user ? user.email : "No user logged in"}</h4>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}

export default Authentication;
