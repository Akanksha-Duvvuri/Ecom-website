"use client";

import { Github, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "60px 40px",
        backgroundColor: "#111",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "40px",
        }}
      >
        <div>
          <h3>TurNext</h3>
          <p style={{ color: "#aaa" }}>
            Modern essentials for modern builders.
          </p>
        </div>

        <div>
          <h4>More</h4>
          <p>About</p>
          <p>Contact</p>
          <p>Cart</p>
        </div>

        <div>
          <p>Account</p>
          <p>Home</p>
          <p>Orders</p>
        </div>

        <div>
          <h4>Follow Us</h4>
          <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>

          <Link href="https://github.com/Akanksha-Duvvuri/Ecom-website">
            <Github />
          </Link>
            
            <Instagram />
            <Twitter />
          </div>
        </div>
      </div>
    </footer>
  );
}