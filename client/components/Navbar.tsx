"use client";

import {
  Terminal,
  User,
  ShoppingCart,
  SlidersHorizontal,
  Search,
} from "lucide-react";

export default function Navbar() {
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
        <h2 style={{ margin: 0, fontWeight: 600 }}>Ternext</h2>
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
        <User size={22} style={{ cursor: "pointer" }} />
        <ShoppingCart size={22} style={{ cursor: "pointer" }} />
        <SlidersHorizontal size={22} style={{ cursor: "pointer" }} />
      </div>
    </nav>
  );
}