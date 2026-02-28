/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// For Vercel deployment, set these variables in the Vercel Dashboard
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDFpQOZ0AekVJuFcrrT1uXj1x-hivwp61w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "impacto-x-hipica.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "impacto-x-hipica",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "impacto-x-hipica.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "129023106186",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:129023106186:web:a322c80c6b67650dc32173",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D7R7MC4BZN"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, auth, firestore };
