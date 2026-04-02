/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const firestore = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app, analytics, auth, firestore, messaging, getToken, onMessage };
