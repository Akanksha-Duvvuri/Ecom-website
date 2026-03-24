"use client";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { label: "Hoodies", emoji: "🧥", query: "Hoodies" },
  { label: "Tops", emoji: "👕", query: "Shirts" },
  { label: "Hats", emoji: "🧢", query: "Hats" },
  { label: "Pants", emoji: "👖", query: "Pants" },
  { label: "Accessories", emoji: "🕶️", query: "Accessories" },
  { label: "Shoes", emoji: "👟", query: "Shoes" },
];

export default function Categories() {
  const router = useRouter();

  return (
    <section style={{ padding: "4rem 2rem", background: "#0f0f0f" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Browse by</p>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff", marginBottom: "2rem" }}>Categories</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {CATEGORIES.map(({ label, emoji, query }) => (
            <div
              key={label}
              onClick={() => router.push(`/shop?q=${query.toLowerCase()}`)}
              style={{
                background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 14, padding: "1.5rem 1rem",
                textAlign: "center", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget.style.borderColor = "#555");
                (e.currentTarget.style.background = "#222");
              }}
              onMouseLeave={e => {
                (e.currentTarget.style.borderColor = "#2a2a2a");
                (e.currentTarget.style.background = "#1a1a1a");
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}