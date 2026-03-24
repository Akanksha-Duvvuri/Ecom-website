"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWishlist } from "@/app/hooks/useWishlist";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  img: string;
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { wishlist, toggle } = useWishlist(); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(4)); // ← only fetch 4
        const snapshot = await getDocs(q);
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section style={{ padding: "4rem 2rem", background: "#0f0f0f" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Hand picked</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff" }}>Featured</h2>
          <Link href="/shop" style={{ fontSize: 13, color: "#555", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}
          >
            View all →
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {products.map((product) => (
            <Link key={product.id} href={`/items/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 14, overflow: "hidden",
                transition: "border-color 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#3a3a3a")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                <div style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#2a2a2a" }}>
                  <Image src={product.img} alt={product.name} fill style={{ objectFit: "cover" }} />
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
                            {wishlist.includes(product.id) ? " ★" : "☆"}
                            </button>

                  {product.stock === 0 && (
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      background: "#1a1a1a", color: "#555",
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      border: "1px solid #2a2a2a",
                    }}>Out of stock</div>
                  )}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{product.name}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>${product.price}</p>
                    <p style={{ fontSize: 11, color: product.stock > 0 ? "#4ade80" : "#f87171" }}>
                      {product.stock > 0 ? `${product.stock} left` : "Sold out"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}