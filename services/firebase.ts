import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1cjqhm01wy1dGUI8YYm3f-pyEAAi_2EI",
  authDomain: "controlpontos.firebaseapp.com",
  projectId: "controlpontos",
  storageBucket: "controlpontos.firebasestorage.app",
  messagingSenderId: "1042294703176",
  appId: "1:1042294703176:web:ad61be70072bf31027c47d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
