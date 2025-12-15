import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const app = initializeApp({
  apiKey: "AIzaSyAr6CdjNEZ6wB3u1lCG2u60VtBPATNYCKs",
  authDomain: "randr-2025-q4.firebaseapp.com",
  projectId: "randr-2025-q4",
  storageBucket: "randr-2025-q4.firebasestorage.app",
  messagingSenderId: "548415554076",
  appId: "1:548415554076:web:69008286839ea9bce995d9"
});

export const db = getFirestore(app);
