"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function FeaturedProducts() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section style={{ padding: "60px 40px" }}>
      <h2 style={{ marginBottom: "30px" }}>New Arrivals</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #eee",
              padding: "20px",
              borderRadius: "10px",
              transition: "0.2s",
            }}
          >
            <h3>{item.name}</h3>
            <p style={{ fontWeight: "bold" }}>${item.price}</p>
            <p style={{ fontSize: "14px", color: "#555" }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}