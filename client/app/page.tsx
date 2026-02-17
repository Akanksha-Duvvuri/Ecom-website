"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Products</h1>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: "20px" }}>
          <h2>{item.name}</h2>
          <p>${item.price}</p>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}