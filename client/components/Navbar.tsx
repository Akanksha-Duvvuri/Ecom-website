"use client";

import {
  Terminal,
  User,
  ShoppingCart,
  SlidersHorizontal,
  Search,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
  const updateCount = () => {
    const stored = localStorage.getItem("cart");

    if (!stored) {
      setCount(0);
      return;
    }

    try {
      const cart = JSON.parse(stored);

      const total = cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );

      setCount(total);
    } catch {
      setCount(0);
    }
  };

  updateCount();

  window.addEventListener("cartUpdated", updateCount);

  return () => {
    window.removeEventListener("cartUpdated", updateCount);
  };
}, []);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 40px",
        borderBottom: "1px solid grey",
        backgroundColor: "#000000ff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <Terminal size={28} />

    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <h2 style={{ margin: 0, fontWeight: 600 }}>TurNext</h2>
    </Link>
    </div>

      {/* Center */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="text"
          placeholder="Search products..."
          style={{
            padding: "8px 12px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          <Search size={16} />
        </button>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link href="/profile">
          <User size={22} style={{ cursor: "pointer" }} />
        </Link>

        <Link href="/cart" style={{ position: "relative" }}>
          <ShoppingCart size={22} style={{ cursor: "pointer" }} />

          {count > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                background: "grey",
                color: "white",
                fontSize: "12px",
                padding: "2px 6px",
                borderRadius: "50%",
              }}
            >
              {count}
            </span>
          )}
        </Link>

        <SlidersHorizontal size={22} style={{ cursor: "pointer" }} />
      </div>
    </nav>
  );
}