"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  img: string;
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

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
    <section style={{ padding: "60px 40px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "30px", fontSize: "30px" }}>Featured Products</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: "30px",
        }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/items/${product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #eee",
                padding: "20px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "300px",
                }}
              >
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              </div>

              <h3 style={{ marginTop: "15px" }}>{product.name}</h3>
              <p style={{ fontWeight: "bold" }}>${product.price}</p>
              <p style={{ color: "#666" }}>Stock: {product.stock}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}