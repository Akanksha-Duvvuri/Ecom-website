"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { useWishlist } from "../hooks/useWishlist";
import Footer from "@/components/Footer";

type Product = {
  id: string;
  name: string;
  price: number;
  img: string;
  category: string;
  stock: number;
};

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(500);
  const [priceLimit, setPriceLimit] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const { wishlist, toggle } = useWishlist();

  useEffect(() => {
    const loadProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(loaded);
      const highest = Math.max(...loaded.map(p => p.price), 500);
      setMaxPrice(highest);
      setPriceLimit(highest);
      setLoading(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products
    .filter(p => {
      const s = search.toLowerCase();
      const name = p.name.toLowerCase();
      const cat = p.category?.toLowerCase() || "";

      const matchesSearch =
        name.includes(s) ||
        cat.includes(s) ||
        name.includes(s.endsWith("s") ? s.slice(0, -1) : s + "s") ||
        cat.includes(s.endsWith("s") ? s.slice(0, -1) : s + "s");

      const matchesCategory = category === "all" || cat === category.toLowerCase();
      const matchesPrice = p.price <= priceLimit;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const stored = localStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];
    const existing = cart.find((i: any) => i.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    window.showToast("Added to cart!");
  };

  const hasActiveFilters = priceLimit < maxPrice || minRating > 0 || category !== "all" || search !== "";

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1.5rem", color: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <h1 style={{ fontSize: 50, fontWeight: 700, marginBottom: "0.25rem" }}>Shop</h1>
        <p style={{ fontSize: 13, color: "#555", marginBottom: "2rem" }}>
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        {/* Search + filters row 1 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              flex: 1, minWidth: 200, padding: "10px 14px",
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 10, color: "#fff", fontSize: 14,
              outline: "none", fontFamily: "inherit",
            }}
            onFocus={e => e.target.style.borderColor = "#555"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />

          <select value={category} onChange={e => setCategory(e.target.value)} style={{
            padding: "10px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 10, color: "#fff", fontSize: 14, outline: "none",
            fontFamily: "inherit", cursor: "pointer",
          }}>
            {categories.map(c => (
              <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
            ))}
          </select>

          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding: "10px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 10, color: "#fff", fontSize: 14, outline: "none",
            fontFamily: "inherit", cursor: "pointer",
          }}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {/* Filter row 2 — price + rating */}
        <div style={{ display: "flex", gap: 16, marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>

          {/* Price range slider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>Up to</span>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={1}
              value={priceLimit}
              onChange={e => setPriceLimit(Number(e.target.value))}
              style={{ width: 120, accentColor: "#fff", cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: "#fff", minWidth: 50 }}>${priceLimit}</span>
          </div>

          {/* Rating filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>Min rating</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setMinRating(minRating === star ? 0 : star)}
                  style={{
                    fontSize: 18, cursor: "pointer",
                    color: star <= minRating ? "#facc15" : "#2a2a2a",
                    transition: "color 0.1s",
                  }}
                >★</span>
              ))}
            </div>
            {minRating > 0 && (
              <span style={{ fontSize: 12, color: "#555" }}>{minRating}+ stars</span>
            )}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setSort("default");
                setPriceLimit(maxPrice);
                setMinRating(0);
              }}
              style={{
                padding: "6px 12px", background: "transparent",
                color: "#555", border: "1px solid #2a2a2a",
                borderRadius: 8, fontSize: 12, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget.style.color = "#fff"); (e.currentTarget.style.borderColor = "#555"); }}
              onMouseLeave={e => { (e.currentTarget.style.color = "#555"); (e.currentTarget.style.borderColor = "#2a2a2a"); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Products grid */}
        {loading ? (
          <div style={{ color: "#555", fontSize: 14, textAlign: "center", padding: "4rem 0" }}>
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>No products match your filters.</p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); setPriceLimit(maxPrice); setMinRating(0); }}
              style={{
                padding: "9px 20px", background: "#fff", color: "#000",
                border: "none", borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {filtered.map(product => (
              <div
                key={product.id}
                onClick={() => router.push(`/items/${product.id}`)}
                style={{
                  background: "#1a1a1a", border: "1px solid #2a2a2a",
                  borderRadius: 14, overflow: "hidden",
                  transition: "border-color 0.15s", cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#3a3a3a")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                {/* Image */}
                <div style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#2a2a2a" }}>
                  {product.img && (
                    <Image src={product.img} alt={product.name} fill style={{ objectFit: "cover" }} />
                  )}
                  {product.stock === 0 && (
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      background: "#1a1a1a", color: "#555",
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      border: "1px solid #2a2a2a",
                    }}>Out of stock</div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      background: "#1a0f00", color: "#f97316",
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      border: "1px solid #3a1f00",
                    }}>Only {product.stock} left</div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); toggle(product.id); }}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      width: 34, height: 34, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 16, zIndex: 1,
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {wishlist.includes(product.id) ? "★" : "☆"}
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{product.name}</p>
                  {product.category && (
                    <p style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>{product.category}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>${product.price}</p>
                    <button
                      onClick={e => addToCart(e, product)}
                      disabled={product.stock === 0}
                      style={{
                        padding: "6px 14px",
                        background: product.stock === 0 ? "#2a2a2a" : "#fff",
                        color: product.stock === 0 ? "#555" : "#000",
                        border: "none", borderRadius: 8, fontSize: 12,
                        fontWeight: 600, cursor: product.stock === 0 ? "not-allowed" : "pointer",
                        fontFamily: "inherit", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { if (product.stock > 0) (e.target as HTMLButtonElement).style.background = "#e8e8e8"; }}
                      onMouseLeave={e => { if (product.stock > 0) (e.target as HTMLButtonElement).style.background = "#fff"; }}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0f0f0f", minHeight: "100vh" }} />}>
      <ShopContent />
      <Footer />
    </Suspense>
  );
}