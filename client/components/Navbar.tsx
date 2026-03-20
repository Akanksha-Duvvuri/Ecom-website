"use client";

import {
  Terminal,
  User,
  ShoppingCart,
  SlidersHorizontal,
  Search,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function Navbar() {
  const [count, setCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);

  const handleSearch = () => {
      if (searchQuery.trim()) {
        router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push("/shop");
      }
  };

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

    onAuthStateChanged(auth, async (user) => {
        if (user) {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists() && snap.data().isAdmin) setIsAdmin(true);
        }
      });

      // Add in the right side of navbar:
      {isAdmin && (
        <Link href="/admin" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>
          Admin
        </Link>
      )}
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
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{
              padding: "8px 12px", width: "300px",
              borderRadius: "6px", border: "1px solid #2a2a2a",
              outline: "none", background: "#1a1a1a",
              color: "#fff", fontFamily: "inherit", fontSize: 14,
            }}
          />
          <button onClick={handleSearch} style={{
            padding: "8px 14px", borderRadius: "6px",
            border: "1px solid #2a2a2a", backgroundColor: "#1a1a1a",
            color: "#fff", cursor: "pointer",
          }}>
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
      </div>
    </nav>
  );
}