"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
                <div
                    style={{
                    position: "relative",
                    width: "100%",
                    height: "350px",
                    }}
                >
                    <Image
                    src={`/${item.image}`}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                </div>

                <h3 style={{ marginTop: "15px" }}>{item.name}</h3>
                <p style={{ fontWeight: "bold" }}>${item.price}</p>
                <p style={{ fontSize: "14px", color: "#555" }}>
                    {item.description}
                </p>
                </div>
            </Link>
            ))}
      </div>
    </section>
  );
}