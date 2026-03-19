"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
  stock: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const updateCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increase = (id: string) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        if (item.quantity >= item.stock) return item;
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    updateCart(updated);
  };

  const decrease = (id: string) => {
    const updated = cart
      .map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0);
    updateCart(updated);
  };

  const removeItem = (id: string) => {
    updateCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1.5rem", color: "#fff" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: "0.25rem" }}>Your Cart</h1>
        <p style={{ fontSize: 13, color: "#555", marginBottom: "2rem" }}>
          {cart.reduce((sum, i) => sum + i.quantity, 0)} {cart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? "item" : "items"}
        </p>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>Your cart is empty.</p>
            <button onClick={() => router.push("/shop")} style={{
              padding: "10px 24px", background: "#fff", color: "#000",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Browse shop
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "flex-start" }}>

            {/* Left — cart items */}
            <div>
              {cart.map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", gap: 16, padding: "20px 0",
                  borderBottom: `1px solid ${i < cart.length - 1 ? "#1a1a1a" : "transparent"}`,
                  alignItems: "center",
                }}>
                  {/* Image */}
                  <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                    <Image
                      src={item.img} alt={item.name} fill
                      style={{ objectFit: "cover", borderRadius: 10 }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>${item.price.toFixed(2)} each</p>

                    {/* Quantity controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => decrease(item.id)} style={{
                        width: 30, height: 30, background: "#1a1a1a",
                        border: "1px solid #2a2a2a", borderRadius: 6,
                        color: "#fff", cursor: "pointer", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                      >−</button>

                      <span style={{ fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: "center" }}>
                        {item.quantity}
                      </span>

                      <button onClick={() => increase(item.id)} style={{
                        width: 30, height: 30, background: "#1a1a1a",
                        border: "1px solid #2a2a2a", borderRadius: 6,
                        color: "#fff", cursor: "pointer", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                      >+</button>

                      <button onClick={() => removeItem(item.id)} style={{
                        marginLeft: 8, padding: "4px 10px",
                        background: "transparent", color: "#555",
                        border: "1px solid #2a2a2a", borderRadius: 6,
                        cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { (e.currentTarget.style.color = "#f87171"); (e.currentTarget.style.borderColor = "#3d1515"); }}
                        onMouseLeave={e => { (e.currentTarget.style.color = "#555"); (e.currentTarget.style.borderColor = "#2a2a2a"); }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item total */}
                  <p style={{ fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Right — order summary */}
            <div style={{
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 14, padding: "1.5rem",
              position: "sticky", top: 80,
            }}>
              <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Order summary</p>

              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 8 }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <hr style={{ border: "none", borderTop: "1px solid #2a2a2a", margin: "14px 0" }} />

              {[
                ["Subtotal", `$${subtotal.toFixed(2)}`],
                ["GST (18%)", `$${gst.toFixed(2)}`],
                ["Shipping", "Free"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 8 }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}

              <hr style={{ border: "none", borderTop: "1px solid #2a2a2a", margin: "14px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 20 }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button onClick={() => router.push("/checkout")} style={{
                width: "100%", padding: 13, background: "#fff", color: "#000",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#e8e8e8")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Proceed to Checkout
              </button>

              <p style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 10 }}>
                Inclusive of 18% GST
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}