"use client";

export default function PhotoGrid() {
  const photos = [
    "/grid1.jpg",
    "/grid2.jpg",
    "/grid3.jpg",
    "/grid4.jpg",
    "/grid5.jpg",
    "/grid6.jpg",
  ];

  return (
    <section style={{ padding: "4rem 2rem", background: "#0f0f0f" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Community</p>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff", marginBottom: "2rem" }}>
          Wear it your way
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}>
          {photos.map((src, i) => (
            <div key={i} style={{
              position: "relative",
              paddingBottom: "100%",
              background: "#1a1a1a",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <img
                src={src}
                alt={`Look ${i + 1}`}
                style={{
                  position: "absolute",
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "#555", textAlign: "center", marginTop: "1.5rem" }}>
          Tag us <span style={{ color: "#aaa" }}>@turnext</span> to be featured
        </p>
      </div>
    </section>
  );
}