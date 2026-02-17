"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";

type Item = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/items/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
  <>
    <div style={{ padding: "60px 40px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "400px",
          }}
        >
          <Image
            src={`/${product.image}`}
            alt={product.name}
            fill
            style={{ objectFit: "cover", borderRadius: "12px" }}
          />
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            {product.name}
          </h1>

          <p style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px" }}>
            ${product.price}
          </p>

          <p style={{ color: "#555", marginBottom: "30px" }}>
            {product.description}
          </p>

          <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
            <button
              style={{
                border: "1px solid grey",
                padding: "3px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              style={{
                border: "1px solid grey",
                padding: "3px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            style={{
              border: "2px solid grey",
              padding: "10px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Add {quantity} to Cart
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </>
);
}