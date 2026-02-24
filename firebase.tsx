import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFpQOZ0AekVJuFcrrT1uXj1x-hivwp61w",
  authDomain: "impacto-x-hipica.firebaseapp.com",
  projectId: "impacto-x-hipica",
  storageBucket: "impacto-x-hipica.firebasestorage.app",
  messagingSenderId: "129023106186",
  appId: "1:129023106186:web:a322c80c6b67650dc32173",
  measurementId: "G-D7R7MC4BZN"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, auth, firestore };
