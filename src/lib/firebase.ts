import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlJGO4YqRL2CtMq9hpYOWMuesnpDRbyR4",
  authDomain: "signup-6c531.firebaseapp.com",
  projectId: "signup-6c531",
  storageBucket: "signup-6c531.firebasestorage.app",
  messagingSenderId: "1075553175213",
  appId: "1:1075553175213:web:257c58be44959c48b7e824",
  measurementId: "G-L47L95383V",
  databaseURL: "https://signup-6c531-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { onAuthStateChanged };

export default app;
