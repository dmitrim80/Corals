import React from "react";
import React, { useState, useEffect } from "react";
import { db } from '../firebase-config';
import { 
    collection,
     getDocs,
      addDoc,
       updateDoc,
       doc,
       deleteDoc } from 'firebase/firestore';


export default function CreateNewUser() {
    const [newName,setNewName] = useState("")
    const [newAge,setNewAge] = useState(0)

    const [users, setUsers] = React.useState([]);
    const usersCollectionRef = collection(db, "users");
    
    const deleteUser = async (id) => {
      const userDoc = doc(db,"users",id)
      await deleteDoc(userDoc)
    }

    const updateUser = async (id, age) => {
      const userDoc = doc(db,"users", id)
      const newFields = {age: age + 1}
      await updateDoc(userDoc,newFields)
    }
    const createUser = async () => {
      await addDoc(usersCollectionRef, {name: newName, age: Number(newAge)})
    }
    React.useEffect(() => {
      const getUsers = async () => {
        const data = await getDocs(usersCollectionRef);
        setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id})))
      };

        getUsers();
      }, []);

    return(
        <>
            <input 
            placeholder="Name..."
            onChange={(event) => {setNewName(event.target.value)}}
            /> 
            <input placeholder="Age..."
            onChange={(event) => {setNewAge(event.target.value)}}
            />
            <button onClick={createUser}>Create User</button>
            {users.map((user) => { 
            return (
            <div>
                {" "}
                <h1 className="test-h1">Name: {user.name}</h1>
                <h1 className="test-h1">Age: {user.age}</h1>
                <button onClick={() => {updateUser(user.id, user.age)}}>Add</button>
                <button on onClick={() => {
                    {deleteUser(user.id)}
                }}>Delete User</button>
                </div> 
                )
            })} 
        </>
    )
    
}