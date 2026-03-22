"use client";
import { Terminal, User, ShoppingCart, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";  //used to navigate between pages (router.push("/"))
import { useEffect, useState } from "react";  //usestate - manages local state in the component and useEffect runs side efftects like fetching data or listening to auth changes etctec... 
import { onAuthStateChanged } from "firebase/auth";   //a firebase functions that listens in real-time to whether a user is logged in or logged out, automatically triggers a callback whenever auth state changes
import { doc, getDoc } from "firebase/firestore";  //doc - creates a ref to a specifix firestory document (like a pointer) and getdoc - actually fetches that document's data from the db
import { auth, db } from "@/lib/firebase";  //instances from the local file - auth - firebase authentication instance and db is firestore db instance

export default function Navbar() {
  const [count, setCount] = useState(0);  //cart item count
  const [searchQuery, setSearchQuery] = useState("");  //search input value 
  const [isAdmin, setIsAdmin] = useState(false);  //admin visibility
  const [menuOpen, setMenuOpen] = useState(false); //dropdown for mobile
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
    };   //reads the cart from local storage and sums up the number of items in the cart

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
    });  //checks if a user logs in - (checks if the auth state is changed) - if yes -> then check is the user is admin - if true- show the admin link if false, then dont show. 

    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      unsub();
    };
  }, []);

  return (
    <>
      <style>{`
        .search-bar { display: flex; }
        .hamburger { display: none; }
        @media (max-width: 640px) {
          .search-bar { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>

      <nav style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 20px",
        borderBottom: "1px solid #2a2a2a",
        backgroundColor: "#000",
        position: "sticky", top: 0, zIndex: 1000,
      }}>

        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Terminal size={24} color="#fff" />
          <Link href="/" style={{ textDecoration: "none", color: "#fff" }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>TurNext</h2>
          </Link>
        </div>

        {/* Center — search (hidden on mobile) */}
        <div className="search-bar" style={{ alignItems: "center", gap: 8 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}     //everytime you type a char in the input - e.target.value is whatever is being typed right? so it updates the searchquery in real time. 
            onKeyDown={e => e.key === "Enter" && handleSearch()}  //press enter or the search icon - it searches. 
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {isAdmin && (
            <Link href="/admin" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>
              Admin
            </Link>
          )}
          <Link href="/profile">
            <User size={22} color="#fff" style={{ cursor: "pointer" }} />
          </Link>
          <Link href="/cart" style={{ position: "relative" }}>
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

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}  //flips the boolean on everyclick.
            style={{
              background: "transparent", border: "none",
              cursor: "pointer", color: "#fff", padding: 0,
              display: "flex", alignItems: "center",
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          display: "flex", flexDirection: "column",
          background: "#0f0f0f", borderBottom: "1px solid #2a2a2a",
          padding: "1rem 20px", gap: 12,
          position: "sticky", top: 57, zIndex: 999,
        }}>
          {/* Mobile search */}
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

          {/* Mobile links */}
          {[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            // { href: "/profile", label: "Account" },
            // { href: "/cart", label: `Cart (${count})` },
            ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 15, color: "#fff",
                textDecoration: "none",
                padding: "10px 0",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}