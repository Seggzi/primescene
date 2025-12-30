// src/firebase.js

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  connectAuthEmulator  // ← NEW
} from 'firebase/auth';

import { 
  getFirestore, 
  connectFirestoreEmulator 
} from 'firebase/firestore';

import { getStorage } from 'firebase/storage'; // optional for future

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyCd3mv2uvlY6E_z3Nt9zHYyZfI2fbBddEw",
  authDomain: "primescene-9cba1.firebaseapp.com",
  projectId: "primescene-9cba1",
  storageBucket: "primescene-9cba1.firebasestorage.app",
  messagingSenderId: "826566424068",
  appId: "1:826566424068:web:9b54990cc312dc0c292751",
  measurementId: "G-V5M8073L9L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();



// Export auth methods
export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
};