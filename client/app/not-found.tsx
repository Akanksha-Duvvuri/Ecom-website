"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{
      background: "#0f0f0f", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: "inherit",
    }}>
      <p style={{ fontSize: 72, fontWeight: 700, color: "#1a1a1a", marginBottom: 0 }}>404</p>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Page not found</p>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 32 }}>This page doesn't exist or was moved.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.back()} style={{
          padding: "10px 20px", background: "transparent", color: "#555",
          border: "1px solid #2a2a2a", borderRadius: 8,
          fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
        }}
          onMouseEnter={e => { (e.currentTarget.style.color = "#fff"); (e.currentTarget.style.borderColor = "#555"); }}
          onMouseLeave={e => { (e.currentTarget.style.color = "#555"); (e.currentTarget.style.borderColor = "#2a2a2a"); }}
        >← Go back</button>
        <button onClick={() => router.push("/")} style={{
          padding: "10px 20px", background: "#fff", color: "#000",
          border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >Go home</button>
      </div>
    </div>
  );
}