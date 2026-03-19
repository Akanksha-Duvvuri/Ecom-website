"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId");

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f0f", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "2rem",
    }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: "2rem" }}>
        TurNext <span style={{ color: "#555" }}>›_</span>
      </p>

      {/* Success icon */}
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#0f2a0f", border: "1px solid #1a4a1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: "1.5rem",
      }}>✓</div>

      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Order placed!</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 6 }}>
        Thanks for shopping at TurNext. Your order is confirmed.
      </p>
      <p style={{ color: "#333", fontSize: 12, marginBottom: "2rem", fontFamily: "monospace" }}>
        Order #{orderId?.slice(-8).toUpperCase()}
      </p>

      {/* What happens next */}
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a",
        borderRadius: 14, padding: "1.5rem", maxWidth: 380,
        width: "100%", marginBottom: "2rem", textAlign: "left",
      }}>
        <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>What happens next</p>
        {[
          ["Order confirmed", "Your order has been received"],
          ["Processing", "We're preparing your items"],
          ["Shipped", "You'll get a tracking number"],
          ["Delivered", "Enjoy your TurNext order!"],
        ].map(([title, desc], i) => (
          <div key={title} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 16 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: i === 0 ? "#fff" : "#2a2a2a",
                border: `1px solid ${i === 0 ? "#fff" : "#3a3a3a"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600,
                color: i === 0 ? "#000" : "#555",
              }}>{i + 1}</div>
              {i < 3 && <div style={{ width: 1, height: 20, background: "#2a2a2a", margin: "4px 0" }} />}
            </div>
            <div style={{ paddingTop: 2 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: i === 0 ? "#fff" : "#555" }}>{title}</p>
              <p style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/profile")} style={{
          padding: "10px 20px", background: "transparent", color: "#aaa",
          border: "1px solid #2a2a2a", borderRadius: 10, cursor: "pointer",
          fontSize: 13, fontWeight: 500, fontFamily: "inherit",
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
        >
          View orders
        </button>
        <button onClick={() => router.push("/")} style={{
          padding: "10px 20px", background: "#fff", color: "#000",
          border: "none", borderRadius: 10, cursor: "pointer",
          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          Keep shopping
        </button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0f0f0f", minHeight: "100vh" }} />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}