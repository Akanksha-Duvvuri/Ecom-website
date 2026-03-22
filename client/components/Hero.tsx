"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <section style={{
      background: "linear-gradient(to bottom, #000000ff, #23092f)",
      height: "92vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "0 2rem",
      position: "relative",
      overflow: "hidden",
    }}>

      <div style={{
        position: "absolute",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <h1 style={{
        fontSize: "clamp(42px, 8vw, 80px)",
        fontWeight: 400,
        color: "#fff",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        marginBottom: "1.5rem",
        maxWidth: 800,
        fontFamily: "inherit",
      }}>
        Build Your<br />
          <span style={{ color: "#555" }}>Identity.</span>
          <span style={{
            display: "inline-block",
            width: 2, height: "0.75em",
            background: "#fff",
            marginLeft: 20,
            verticalAlign: "middle",
            animation: "blink 1.5s ease-in-out infinite",
          }} />
        </h1>

        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

      <p style={{
        fontSize: "clamp(14px, 2vw, 18px)",
        color: "#555",
        maxWidth: 480,
        lineHeight: 1.7,
        marginBottom: "2.5rem",
      }}>
        Style is a way to say who you are without having to speak. Discover TurNext.
      </p>


      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/shop" style={{
          fontSize: 14, fontWeight: 600, color: "#000",
          background: "#fff", textDecoration: "none",
          padding: "13px 40px", borderRadius: 10,
          transition: "background 0.15s",
          display: "inline-block", margin: "50px" ,
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          Shop now
        </Link>
      </div>

    </section>
  );
}