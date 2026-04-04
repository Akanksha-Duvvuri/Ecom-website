"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, //used to trigger the google sign in popup
  GoogleAuthProvider
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login"); //controls whether to show login or sign up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const googleProvider = new GoogleAuthProvider(); //creates a google auth provider instance.  

 const handleGoogle = async () => {
  setError("");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const snap = await getDoc(doc(db, "users", user.uid));  //after the google signin, it checks if the user already exists.
    if (!snap.exists()) {
      // New user — create profile with empty cart and clears localstorage cart since its a new account
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "User_" + Math.random().toString(36).substring(2, 7).toUpperCase(),
        phone: "",
        address: { street: "", city: "", zip: "", country: "" },
        cart: [],
        createdAt: new Date(),
      });
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      // Existing user — restore their cart and localstorage
      const firestoreCart = snap.data().cart || [];
      localStorage.setItem("cart", JSON.stringify(firestoreCart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
    router.push("/profile");
  } catch (err: any) {
    setError(err.message);
  }
};

  const handleForgotPassword = async () => {
  if (!email) {
    setError("Enter your email above first, then click Forgot password.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setError(""); 
    window.showToast("Password reset email sent! Check your inbox.", "info");
  } catch (err: any) {
    setError(err.message);
  }
};

const handleSubmit = async () => { //login or signup via email and password directly
  setError("");
  try {
    if (tab === "login") {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const firestoreCart = snap.data().cart || [];
        localStorage.setItem("cart", JSON.stringify(firestoreCart));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const fullName = `${firstName} ${lastName}`.trim() ||
        "User_" + Math.random().toString(36).substring(2, 7).toUpperCase();
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: fullName,
        phone: "",
        address: { street: "", city: "", zip: "", country: "" },
        cart: [],
        createdAt: new Date(),
      });
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
    }
    router.push("/profile");
  } catch (err: any) {
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
          display: "inline-block", width: 2, height: 40,
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

      <div style={{
        width: "100%", maxWidth: 450, background: "#1a1a1a",
        border: "1px solid #2a2a2a", borderRadius: 16, padding: "2rem 1.75rem",
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 30 }}>
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>

        {/* Google button */}
        <button onClick={handleGoogle} style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10, padding: "10px 12px",
          background: "#111", border: "1px solid #2a2a2a",
          borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit", marginBottom: "1rem",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ flex: 1, height: "0.5px", background: "#2a2a2a" }} />
          <span style={{ fontSize: 12, color: "#555" }}>or</span>
          <div style={{ flex: 1, height: "0.5px", background: "#2a2a2a" }} />
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: "#111",
          borderRadius: 10, padding: 4, marginBottom: "1.5rem",
        }}>
          {["login", "signup"].map(t => (
            <div key={t} onClick={() => { setTab(t); setFirstName(""); setLastName(""); }} style={{
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

        {/* First + Last name — signup only */}
        {tab === "signup" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 5 }}>First name</label>
              <input placeholder="" value={firstName} onChange={e => setFirstName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#555"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 5 }}>Last name</label>
              <input placeholder="" value={lastName} onChange={e => setLastName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#555"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"}
              />
            </div>
          </div>
        )}

        {/* Email + Password */}
        {[
          { label: "Email", type: "email", value: email, set: setEmail, placeholder: "" },
          { label: "Password", type: "password", value: password, set: setPassword, placeholder: "" },
        ].map(({ label, type, value, set, placeholder }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 5 }}>{label}</label>
            <input type={type} placeholder={placeholder} value={value}
              onChange={e => set(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#555"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"}
            />
          </div>
        ))}

        {tab === "login" && (
          <p
            onClick={handleForgotPassword}
            style={{ fontSize: 12, color: "#555", textAlign: "right", marginBottom: "1.25rem", cursor: "pointer" }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = "#aaa"}
            onMouseLeave={e => (e.target as HTMLElement).style.color = "#555"}
          >
            Forgot password?
          </p>
        )}
        
        {error && (
          <p style={{ fontSize: 13, color: "#f87171", background: "#1f0a0a", border: "1px solid #3d1515", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button onClick={handleSubmit} style={{
          width: "100%", padding: 11, background: "#fff", color: "#000",
          border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.target as HTMLButtonElement).style.background = "#e8e8e8"}
          onMouseLeave={e => (e.target as HTMLButtonElement).style.background = "#fff"}
          onMouseDown={e => (e.target as HTMLButtonElement).style.transform = "scale(0.98)"}
          onMouseUp={e => (e.target as HTMLButtonElement).style.transform = "scale(1)"}>
          {tab === "login" ? "Sign in" : "Create account"}
        </button>

        <p style={{ fontSize: 13, color: "#555", textAlign: "center", marginTop: "1.25rem" }}>
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setTab(tab === "login" ? "signup" : "login")}
            style={{ color: "#aaa", cursor: "pointer" }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.target as HTMLElement).style.color = "#aaa"}>
            {tab === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}