"use client";

export default function Hero() {
  return (
    <section
      style={{
        padding: "100px 40px",
        textAlign: "center",
        background: "linear-gradient(to bottom, #f8f8f8, #ffffff)",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Build Your Identity.
      </h1>
      <p
        style={{
          fontSize: "18px",
          color: "#555",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        “Style is a way to say who you are without having to speak.”
      </p>
    </section>
  );
}