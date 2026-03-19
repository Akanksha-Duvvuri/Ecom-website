"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        // padding: "100px 40px",
        textAlign: "center",
        background: "linear-gradient(to bottom, #000000ff, #16092f)",
        height: "92vh",
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

      <Link href="/shop" style={{ fontSize: 20, color: "#fff", textDecoration: "none", border: "1px solid grey", padding: "12px", borderRadius: "10px"}}>
          Shop Now
      </Link>
    </section>
  );
}