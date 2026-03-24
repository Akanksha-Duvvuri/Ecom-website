"use client";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { label: "Hoodies", query: "Hoodies" },
  { label: "Tops", query: "Shirts" },
  { label: "Hats", query: "Hats" },
  { label: "Pants", query: "Pants" },
  { label: "Accessories", query: "Accessories" },
  { label: "Shoes", query: "Shoes" },
];

export default function Categories() {
  const router = useRouter();

  return (
    <section style={{ padding: "4rem 2rem", background: "#0f0f0f" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{
          fontSize: 11,
          color: "#555",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8
        }}>
          Browse by
        </p>

        <h2 style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "2rem"
        }}>
          Categories
        </h2>

        <div className="categories-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {CATEGORIES.map(({ label, query }) => (
            <div
              key={label}
              onClick={() => router.push(`/shop?q=${query}`)}
              className="category-card"
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: 14,
                padding: "1.75rem 1rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <p style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#fff",
                letterSpacing: "0.02em"
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Hover only where supported */
        @media (hover: hover) {
          .category-card:hover {
            border-color: #555;
            background: #222;
            transform: translateY(-2px);
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          section {
            padding: 3rem 1.25rem !important;
          }

          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}