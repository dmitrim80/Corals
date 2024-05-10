import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const CoralSignup = () => {
  const auth = getAuth();
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const usersCollectionRef = collection(db, "users");

  const navigate = useNavigate();
  const deleteUser = async (id) => {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);
  };



  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      setError("Email and password are required");
      return;
    }
    setError(""); // Clear any existing errors
    createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        addDoc(usersCollectionRef, {
          uid: user.uid,
          firstName: newFirstName,
          lastName: newLastName,
          email: newUserEmail, // Store only non-sensitive data in Firestore
        });
      })
      .catch((error) => {
        setError(error.message);
      });
      if(auth.currentUser){
        console.log(auth.currentUser)
        navigate("/corals/homepage");
      }
  };


  return (
    <>
      <div>Sign up</div>
      <div>
        <input
          placeholder="First Name:"
          onChange={(event) => setNewFirstName(event.target.value)}
        />
        <input
          placeholder="Last Name:"
          onChange={(event) => setNewLastName(event.target.value)}
        />
        <br/>
        <input
          placeholder="Email:"
          onChange={(event) => setNewUserEmail(event.target.value)}
        />
        <input
          placeholder="Password:"
          type="password" // Hide password input
          onChange={(event) => setNewUserPassword(event.target.value)}
        />
        <button onClick={createUser}>Create User</button>
      </div>
    </>
  );
};

export default CoralSignup;
