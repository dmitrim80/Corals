import React, { useState, useEffect } from "react";
import { db } from "./CoralFirebase-config";
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

  const deleteUser = async (id) => {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);
  };
  console.log(auth.currentUser);
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
  };

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getUsers();
  }, [usersCollectionRef]);

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
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      {users.map((user) => (
        <div key={user.id}>
          <h1>First Name: {user.firstName}</h1>
          <h1>Last Name: {user.lastName}</h1>
          <h1>Email: {user.email}</h1>
          <button onClick={() => deleteUser(user.id)}>Delete User</button>
        </div>
      ))}
    </>
  );
};

export default CoralSignup;
