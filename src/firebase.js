// src/firebase.js

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Your web app's Firebase configuration (looks correct!)
const firebaseConfig = {
  apiKey: "AIzaSyCd3mv2uvlY6E_z3Nt9zHYyZfI2fbBddEw",
  authDomain: "primescene-9cba1.firebaseapp.com",
  projectId: "primescene-9cba1",
  storageBucket: "primescene-9cba1.firebasestorage.app",
  messagingSenderId: "826566424068",
  appId: "1:826566424068:web:9b54990cc312dc0c292751",
  measurementId: "G-V5M8073L9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export auth methods
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};