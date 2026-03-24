export default function BrandStory() {
  return (
    <section style={{ padding: "4rem 2rem", background: "#111" }}>
      <div
        className="brand-grid"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        {/* Text */}
        <div>
          <p style={{
            fontSize: 11,
            color: "#555",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8
          }}>
            Our story
          </p>

          <h2 style={{
            fontSize: "clamp(24px, 6vw, 40px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: "1.25rem"
          }}>
            Clothes that speak<br />
            <span style={{ color: "#555" }}>before you do.</span>
          </h2>

          <p style={{
            fontSize: 14,
            color: "#666",
            lineHeight: 1.7,
            marginBottom: "1rem"
          }}>
            TurNext was built for people who see fashion as a language. Every piece we carry is chosen with intention — minimal, bold, and built to last.
          </p>

          <p style={{
            fontSize: 14,
            color: "#666",
            lineHeight: 1.7
          }}>
            We believe your wardrobe should reflect who you are, not who you're expected to be. That's the TurNext identity.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}>
          {[
            { number: "500+", label: "Products" },
            { number: "10k+", label: "Customers" },
            { number: "4.9★", label: "Avg rating" },
            { number: "Free", label: "Shipping" },
          ].map(({ number, label }) => (
            <div key={label} style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 14,
              padding: "1.25rem",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4
              }}>
                {number}
              </p>
              <p style={{ fontSize: 12, color: "#555" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          section {
            padding: 3rem 1.25rem !important;
          }

          .brand-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}