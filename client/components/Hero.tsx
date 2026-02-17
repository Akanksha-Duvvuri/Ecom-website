"use client";

export default function Hero() {
  return (
    <section
      style={{
        // padding: "100px 40px",
        textAlign: "center",
        background: "linear-gradient(to bottom, #000000ff, #104f47ff)",
        height: "95vh",
      }}
    >
      <h1 style={{ fontSize: "60px", marginBottom: "20px", padding: "130px", }}>
        TurNext <br></br>
        Build Your Identity.
      </h1>
      <p
        style={{
          fontSize: "30px",
          color: "#555",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "50px",
        }}
      >
        “Style is a way to say who you are without having to speak.”
      </p>
    </section>
  );
}