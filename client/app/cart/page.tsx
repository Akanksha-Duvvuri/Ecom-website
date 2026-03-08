"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type CartItem = {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const removeItem = (id: string) => {
            const updated = cart
                .map((item) =>
                item.id === id
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
                )
                .filter((item) => item.quantity > 0);

            setCart(updated);
            localStorage.setItem("cart", JSON.stringify(updated));
            };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main style={{ padding: "60px 40px" }}>
      <h1 style={{ marginBottom: "30px" }}>Your Cart</h1>

      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT SIDE — CART ITEMS */}
        <div style={{ flex: 2 }}>
          {cart.length === 0 && <p>Your cart is empty.</p>}

          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "20px",
                borderBottom: "1px solid #eee",
                padding: "20px 0",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                }}
              >
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <h3>{item.name}</h3>
                <p>${item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid grey",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE — PRICE SUMMARY */}
        {cart.length > 0 && (
          <div
            style={{
              flex: 1,
              border: "1px solid #eee",
              padding: "20px",
              borderRadius: "10px",
              height: "fit-content",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Order Summary</h2>

            <p style={{ marginBottom: "10px" }}>
              Items: {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </p>

            <p style={{ marginBottom: "20px", fontWeight: "bold" }}>
              Total: ${total}
            </p>

            <button
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid black",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </main>
  );
}