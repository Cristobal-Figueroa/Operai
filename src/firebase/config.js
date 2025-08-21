// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoMsZl12YjOechWmdVy1RQhfXjXtYwRNo",
  authDomain: "operai-46162.firebaseapp.com",
  projectId: "operai-46162",
  storageBucket: "operai-46162.firebasestorage.app",
  messagingSenderId: "932164167351",
  appId: "1:932164167351:web:33cda0cc7853077be38f32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

export { db, auth };
