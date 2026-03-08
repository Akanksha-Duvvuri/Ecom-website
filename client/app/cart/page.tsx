"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
};

import { doc, updateDoc, increment } from "firebase/firestore";

export default function CartPage() {
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
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);

    updateCart(updated);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const checkout = async () => {
  const stored = localStorage.getItem("cart");
  if (!stored) return;

  const cartItems = JSON.parse(stored);

  const total = cartItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  try {
    await addDoc(collection(db, "orders"), {
      items: cartItems,
      total,
      createdAt: serverTimestamp(),
    });

    for (const item of cartItems) {
      const productRef = doc(db, "products", item.id);

      await updateDoc(productRef, {
        stock: increment(-item.quantity),
      });
    }


    localStorage.removeItem("cart");

    window.dispatchEvent(new Event("cartUpdated"));

    // alert("Order placed successfully!");

  } catch (error) {
    console.error("Checkout error:", error);
  }
};

  return (
    <main style={{ padding: "60px 40px" }}>
      <h1 style={{ marginBottom: "30px" }}>Your Cart</h1>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

        {/* LEFT SIDE — CART ITEMS */}
        <div style={{ flex: 2 }}>
          {cart.length === 0 && <p>Your cart is empty.</p>}

          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "20px",
                padding: "20px 0",
                borderBottom: "1px solid #eee",
                alignItems: "center",
              }}
            >
              {/* Product Image */}
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <h3>{item.name}</h3>
                <p>${item.price}</p>

                {/* Quantity Controls */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => decrease(item.id)}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid grey",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increase(item.id)}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid grey",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    marginTop: "10px",
                    padding: "6px 10px",
                    border: "1px solid grey",
                    borderRadius: "4px",
                    cursor: "pointer",
                    background: "transparent",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE — ORDER SUMMARY */}
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

            <p style={{ fontWeight: "bold", marginBottom: "20px" }}>
              Total: ${total.toFixed(2)}
            </p>

            <button
                onClick={checkout}
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