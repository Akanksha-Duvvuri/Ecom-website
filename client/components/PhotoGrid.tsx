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
        <p style={{
          fontSize: 11,
          color: "#555",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8
        }}>
          Community
        </p>

        <h2 style={{
          fontSize: "clamp(24px, 5vw, 36px)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "2rem"
        }}>
          Wear it your way
        </h2>

        <div className="photo-grid" style={{
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
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s",
                }}
                className="photo-img"
              />
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 13,
          color: "#555",
          textAlign: "center",
          marginTop: "1.5rem"
        }}>
          Tag us <span style={{ color: "#aaa" }}>@turnext</span> to be featured
        </p>
      </div>

      <style>{`
        /* Hover only on devices that support it */
        @media (hover: hover) {
          .photo-img:hover {
            transform: scale(1.05);
          }
        }

        /* Tablet */
        @media (max-width: 900px) {
          .photo-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          section {
            padding: 3rem 1.25rem !important;
          }

          .photo-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </section>
  );
}