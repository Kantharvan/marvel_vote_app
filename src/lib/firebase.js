import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, writeBatch, deleteDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr6CdjNEZ6wB3u1lCG2u60VtBPATNYCKs",
  authDomain: "randr-2025-q4.firebaseapp.com",
  projectId: "randr-2025-q4",
  storageBucket: "randr-2025-q4.firebasestorage.app",
  messagingSenderId: "548415554076",
  appId: "1:548415554076:web:69008286839ea9bce995d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, query, getDocs, writeBatch, deleteDoc, onSnapshot };
