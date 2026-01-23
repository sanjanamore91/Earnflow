import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlJGO4YqRL2CtMq9hpYOWMuesnpDRbyR4",
  authDomain: "signup-6c531.firebaseapp.com",
  projectId: "signup-6c531",
  storageBucket: "signup-6c531.firebasestorage.app",
  messagingSenderId: "1075553175213",
  appId: "1:1075553175213:web:257c58be44959c48b7e824",
  measurementId: "G-L47L95383V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
