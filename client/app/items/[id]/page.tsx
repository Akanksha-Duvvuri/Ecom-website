import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductClient from "./ProductClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return { title: "Product not found — TurNext" };
  const product = snap.data();
  return {
    title: `${product.name} — TurNext`,
    description: `${product.name} for $${product.price}. Shop now on TurNext.`,
    openGraph: {
      title: `${product.name} — TurNext`,
      description: `$${product.price} · ${product.category || ""}`,
      images: [{ url: product.img }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProductClient />;
}