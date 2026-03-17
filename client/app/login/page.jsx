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
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#0f0f0f",
    }}>

      <h1 style={{
        fontSize: 50, fontWeight: 700, color: "#fff",
        marginBottom: "1.5rem", letterSpacing: "-0.01em",
      }}>
        TurNext <span style={{ color: "#666" }}>{">_"}</span>
        <span style={{
          display: "inline-block", width: 2, height: 40, margin: 20,
          background: "#fff", marginLeft: 3, verticalAlign: "middle",
          animation: "blink 1.2s ease-in-out infinite",
        }} />
      </h1>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          20% { opacity: 0; }
        }
      `}</style>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 450, background: "#1a1a1a",
        border: "1px solid #2a2a2a", borderRadius: 16, padding: "2rem 1.75rem",
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: "1.75rem" }}>
          {tab === "login" ? "Sign in to your account to continue" : "Get started for free"}
        </p>

        <div style={{
          display: "flex", gap: 4, background: "#111",
          borderRadius: 10, padding: 4, marginBottom: "1.5rem",
        }}>
          {["login", "signup"].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "7px", fontSize: 13, fontWeight: 500,
              textAlign: "center", borderRadius: 7, cursor: "pointer",
              background: tab === t ? "#2a2a2a" : "transparent",
              color: tab === t ? "#fff" : "#555",
              transition: "all 0.15s", userSelect: "none",
            }}>
              {t === "login" ? "Sign in" : "Create account"}
            </div>
          ))}
        </div>

        {[
          { label: "Email", type: "email", value: email, set: setEmail, placeholder: "name@example.com" },
          { label: "Password", type: "password", value: password, set: setPassword, placeholder: "••••••••" },
        ].map(({ label, type, value, set, placeholder }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 5 }}>{label}</label>
            <input
              type={type} placeholder={placeholder} value={value}
              onChange={e => set(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", background: "#111",
                border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff",
                fontSize: 14, outline: "none", fontFamily: "inherit",
              }}
              onFocus={e => e.target.style.borderColor = "#555"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"}
            />
          </div>
        ))}

        {tab === "login" && (
          <p style={{ fontSize: 12, color: "#555", textAlign: "right", marginBottom: "1.25rem", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color = "#aaa"}
            onMouseLeave={e => e.target.style.color = "#555"}>
            Forgot password?
          </p>
        )}

        {error && (
          <p style={{
            fontSize: 13, color: "#f87171", background: "#1f0a0a",
            border: "1px solid #3d1515", borderRadius: 8,
            padding: "8px 12px", marginBottom: 12,
          }}>{error}</p>
        )}

        <button onClick={handleSubmit} style={{
          width: "100%", padding: 11, background: "#fff", color: "#000",
          border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
        }}
          onMouseEnter={e => e.target.style.background = "#e8e8e8"}
          onMouseLeave={e => e.target.style.background = "#fff"}
          onMouseDown={e => e.target.style.transform = "scale(0.98)"}
          onMouseUp={e => e.target.style.transform = "scale(1)"}>
          {tab === "login" ? "Sign in" : "Create account"}
        </button>

        <p style={{ fontSize: 13, color: "#555", textAlign: "center", marginTop: "1.25rem" }}>
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setTab(tab === "login" ? "signup" : "login")}
            style={{ color: "#aaa", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = "#aaa"}>
            {tab === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}