import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC5HAywpfQ6XI6GAcXZpZuB-Nw_75prY_o",
    authDomain: "dmpage-72e3e.firebaseapp.com",
    projectId: "dmpage-72e3e",
    storageBucket: "dmpage-72e3e.appspot.com",
    messagingSenderId: "200086784221",
    appId: "1:200086784221:web:429feb8639d04330967334",
    measurementId: "G-5G4SD327J0"
  };
  const app = initializeApp(firebaseConfig);
  
  
  
  
  // const analytics = getAnalytics(app);

  export const auth = getAuth(app)
  export const db = getFirestore(app);
  export const storage = getStorage(app)
  