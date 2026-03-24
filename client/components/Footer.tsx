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
          <Link href="/">
              <p>More</p>
          </Link>
          <Link href="/about">
              <p>About</p>
          </Link>
          <Link href="/about">
              <p>Contact</p>
          </Link>
        </div>

        <div>
          <Link href="/profile">
              <p>Account</p>
          </Link>
          <Link href="/">
              <p>Home</p>
          </Link>
         <Link href="/cart">
              <p>Cart</p>
          </Link>
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