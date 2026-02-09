import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/";
      }
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Você está logado 🎉</p>
    </div>
  );
}
