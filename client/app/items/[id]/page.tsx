"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
};

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProduct({
          id: snap.id,
          ...(snap.data() as Omit<Item, "id">),
        });
      }
    };

    fetchProduct();
  }, [id]);

  function addToCart() {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find((item: any) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // alert("Added to cart!");
  }

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
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "400px",
            }}
          >
            <Image
              src={product.img}
              alt={product.name}
              fill
              style={{ objectFit: "cover", borderRadius: "12px" }}
            />
          </div>

          <div>
            <h1>{product.name}</h1>
            <p>${product.price}</p>
            <p>Stock: {product.stock}</p>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ border: "1px solid white", padding: "3px", borderRadius: "25%", cursor: "pointer"}}
                >
                -
              </button>

              <span>{quantity}</span>

              <button  onClick={() =>
                              setQuantity((q) =>
                                product && q < product.stock ? q + 1 : q
                              )
                            } 
              style={{ border: "1px solid white", padding: "3px", borderRadius: "25%", cursor: "pointer"}}>+</button>
            </div>

            <button
              onClick={addToCart}
              style={{
                marginTop: "20px",
                padding: "10px",
                border: "1px solid grey",
                cursor: "pointer"
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