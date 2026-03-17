"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      if (tab === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 1rem" }}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmit}>{tab === "login" ? "Sign in" : "Create account"}</button>
      <p onClick={() => setTab(tab === "login" ? "signup" : "login")}>
        {tab === "login" ? "No account? Sign up" : "Have an account? Sign in"}
      </p>
    </div>
  );
}