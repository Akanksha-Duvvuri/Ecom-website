"use client";
import { Terminal, User, ShoppingCart, Search, Menu, X, ShoppingBag, House} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function Navbar() {
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/shop");
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem("cart");
      if (!stored) { setCount(0); return; }
      try {
        const cart = JSON.parse(stored);
        setCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
      } catch { setCount(0); }
    };

    updateCount();
    window.addEventListener("cartUpdated", updateCount);

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().isAdmin) setIsAdmin(true);
        else setIsAdmin(false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      unsub();
    };
  }, []);

  return (
    <>
      <style>{`
        .nav-search { display: flex; align-items: center; gap: 8px; }
        .nav-hamburger { display: none; }
        @media (max-width: 700px) {
          .nav-search { display: none !important; }
          .nav-icons { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        backgroundColor: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>


        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Terminal size={24} color="#fff" />
          <Link href="/about" style={{ textDecoration: "none", color: "#fff" }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>TurNext</h2>
          </Link>
        </div>

        {/* Center — search */}
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{
              padding: "8px 12px", width: "280px",
              borderRadius: 6, border: "1px solid #2a2a2a",
              outline: "none", background: "#1a1a1a",
              color: "#fff", fontFamily: "inherit", fontSize: 14,
            }}
          />
          <button onClick={handleSearch} style={{
            padding: "8px 12px", borderRadius: 6,
            border: "1px solid #2a2a2a", background: "#1a1a1a",
            color: "#fff", cursor: "pointer",
          }}>
            <Search size={16} />
          </button>
        </div>

        {/* Right */}
        <div className = "nav-icons"
        style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {isAdmin && (
            <span style={{ fontSize: 13, color: "#aaa", cursor: "default" }}>
              Admin
            </span>
          )}
          <Link href="/">
            <Terminal size={22} color="#fff" style={{ cursor: "pointer" }} />
          </Link>
          <Link href="/shop" aria-label="Shop">
            <ShoppingBag size={22} color="#fff" style={{ cursor: "pointer" }} />
          </Link>
          <Link href="/profile" aria-label="Account">
            <User size={22} color="#fff" style={{ cursor: "pointer" }} />
          </Link>
          <Link href="/cart" style={{ position: "relative" }}  aria-label={`Cart, ${count} items`}>
            <ShoppingCart size={22} color="#fff" style={{ cursor: "pointer" }} />
            {count > 0 && (
              <span style={{
                position: "absolute", top: -8, right: -10,
                background: "#fff", color: "#000",
                fontSize: 11, fontWeight: 600,
                padding: "2px 6px", borderRadius: "50%",
                minWidth: 18, textAlign: "center",
              }}>
                {count}
              </span>
            )}
          </Link>
        </div>
         {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "transparent", border: "none",
              cursor: "pointer", color: "#fff", padding: 0,
              alignItems: "center",
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          display: "flex", flexDirection: "column",
          background: "#0f0f0f", borderBottom: "1px solid #2a2a2a",
          padding: "1rem 20px", gap: 12,
          position: "sticky", top: 57, zIndex: 999,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1, padding: "9px 12px",
                borderRadius: 8, border: "1px solid #2a2a2a",
                outline: "none", background: "#1a1a1a",
                color: "#fff", fontFamily: "inherit", fontSize: 14,
              }}
            />
            <button onClick={handleSearch} style={{
              padding: "9px 12px", borderRadius: 8,
              border: "1px solid #2a2a2a", background: "#1a1a1a",
              color: "#fff", cursor: "pointer",
            }}>
              <Search size={16} />
            </button>
          </div>

          {[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            { href: "/profile", label: "Account" },
            { href: "/cart", label: `Cart (${count})` },
            ...(isAdmin ? [{ href: "#", label: "Admin", disabled: true }] : []),
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              fontSize: 15, color: "#fff",
              textDecoration: "none",
              padding: "10px 0",
              borderBottom: "1px solid #1a1a1a",
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}