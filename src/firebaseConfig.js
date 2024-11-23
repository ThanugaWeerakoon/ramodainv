// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVzySKhVwtvmEN5aTnL4Yy7j2wIQV-704",
  authDomain: "ramodainv.firebaseapp.com",
  projectId: "ramodainv",
  storageBucket: "ramodainv.firebasestorage.app",
  messagingSenderId: "251915013919",
  appId: "1:251915013919:web:9242d0df60de555ce02a2a",
  measurementId: "G-2RY7Q576QG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
