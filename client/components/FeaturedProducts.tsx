"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function FeaturedProducts() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Item, "id">),
        }));

        console.log(products);

        setItems(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section style={{ padding: "60px 40px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "30px", fontSize: "30px" }}>New Arrivals</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: "30px",
        }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #eee",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <h3>{item.name}</h3>
              <p style={{ fontWeight: "bold" }}>${item.price}</p>
              <p style={{ color: "#555" }}>Stock: {item.stock}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}