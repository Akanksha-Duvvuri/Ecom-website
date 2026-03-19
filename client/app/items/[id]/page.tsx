"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
  img: string;
  category?: string;
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProduct({ id: snap.id, ...(snap.data() as Omit<Item, "id">) });
      }
    };
    fetchProduct();
  }, [id]);

  function addToCart() {
    if (!product) return;
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item.id === product.id && item.size === selectedSize);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        stock: product.stock,
        size: selectedSize,
        quantity,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555" }}>Loading...</p>
    </div>
  );

  return (
    <>
      <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "3rem 2rem", color: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Back */}
          <p onClick={() => router.back()} style={{ fontSize: 13, color: "#555", cursor: "pointer", marginBottom: "2rem", display: "inline-block" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#aaa")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}
          >
            ← Back
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>

            {/* Image */}
            <div style={{ position: "relative", width: "100%", height: "500px", borderRadius: 16, overflow: "hidden", background: "#1a1a1a" }}>
              <Image src={product.img} alt={product.name} fill style={{ objectFit: "cover" }} />
            </div>

            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {product.category && (
                <p style={{ fontSize: 12, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  {product.category}
                </p>
              )}
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{product.name}</h1>
              <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>${product.price.toFixed(2)}</p>
              <p style={{ fontSize: 12, color: product.stock > 0 ? "#4ade80" : "#f87171", marginBottom: "2rem" }}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>

              {/* Size selector */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: 12, color: sizeError ? "#f87171" : "#555", marginBottom: 10, transition: "color 0.15s" }}>
                  {sizeError ? "Please select a size" : "Select size"}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      style={{
                        width: 48, height: 48,
                        background: selectedSize === size ? "#fff" : "#1a1a1a",
                        color: selectedSize === size ? "#000" : "#fff",
                        border: `1px solid ${sizeError ? "#3d1515" : selectedSize === size ? "#fff" : "#2a2a2a"}`,
                        borderRadius: 8, cursor: "pointer",
                        fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { if (selectedSize !== size) (e.currentTarget.style.borderColor = "#555"); }}
                      onMouseLeave={e => { if (selectedSize !== size) (e.currentTarget.style.borderColor = sizeError ? "#3d1515" : "#2a2a2a"); }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>Quantity</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                    width: 36, height: 36, background: "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 8,
                    color: "#fff", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                  >−</button>
                  <span style={{ fontSize: 15, fontWeight: 500, minWidth: 24, textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => product && q < product.stock ? q + 1 : q)} style={{
                    width: 36, height: 36, background: "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 8,
                    color: "#fff", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                  >+</button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                style={{
                  padding: "13px", width: "100%",
                  background: added ? "#0f2a0f" : product.stock === 0 ? "#1a1a1a" : "#fff",
                  color: added ? "#4ade80" : product.stock === 0 ? "#555" : "#000",
                  border: `1px solid ${added ? "#1a4a1a" : "transparent"}`,
                  borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: product.stock === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!added && product.stock > 0) (e.currentTarget.style.background = "#e8e8e8"); }}
                onMouseLeave={e => { if (!added && product.stock > 0) (e.currentTarget.style.background = "#fff"); }}
              >
                {added ? "Added to cart!" : product.stock === 0 ? "Out of stock" : `Add ${quantity} to cart`}
              </button>

              <button onClick={() => router.push("/cart")} style={{
                marginTop: 10, padding: "11px", width: "100%",
                background: "transparent", color: "#555",
                border: "1px solid #2a2a2a", borderRadius: 10,
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget.style.color = "#fff"); (e.currentTarget.style.borderColor = "#555"); }}
                onMouseLeave={e => { (e.currentTarget.style.color = "#555"); (e.currentTarget.style.borderColor = "#2a2a2a"); }}
              >
                View cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}