"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
  img: string;
  category?: string;
};

type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProduct({ id: snap.id, ...(snap.data() as Omit<Item, "id">) });
      }
      const reviewsRef = collection(db, "products", id, "reviews");
      const q = query(reviewsRef, orderBy("createdAt", "desc"));
      const reviewSnap = await getDocs(q);
      setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    };
    fetchAll();
  }, [id]);

  function addToCart() {
    if (!product) return;
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item.id === product.id && item.size === selectedSize);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id, name: product.name,
        price: product.price, img: product.img,
        stock: product.stock, size: selectedSize, quantity,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const submitReview = async () => {
    const user = auth.currentUser;
    if (!user) { setReviewError("Sign in to leave a review."); return; }
    if (rating === 0) { setReviewError("Please select a star rating."); return; }
    if (!comment.trim()) { setReviewError("Please write a comment."); return; }
    setSubmitting(true);
    setReviewError("");
    const reviewsRef = collection(db, "products", id, "reviews");
    const ref = await addDoc(reviewsRef, {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      rating, comment: comment.trim(),
      createdAt: serverTimestamp(),
    });
    setReviews(prev => [{
      id: ref.id, userId: user.uid,
      userName: user.displayName || "Anonymous",
      rating, comment: comment.trim(), createdAt: new Date(),
    }, ...prev]);
    setRating(0);
    setComment("");
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (!product) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555" }}>Loading...</p>
    </div>
  );

  return (
    <>
      <style>{`
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        .product-image { position: relative; width: 100%; height: 500px; border-radius: 16px; overflow: hidden; background: #1a1a1a; }
        @media (max-width: 640px) {
          .product-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .product-image { height: 320px; }
        }
      `}</style>

      <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1.25rem", color: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Back */}
          <p onClick={() => router.back()} style={{
            fontSize: 13, color: "#555", cursor: "pointer",
            marginBottom: "1.5rem", display: "inline-block",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#aaa")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}
          >
            ← Back
          </p>

          <div className="product-grid">

            {/* Image */}
            <div className="product-image">
              <Image src={product.img} alt={product.name} fill style={{ objectFit: "cover" }} />
            </div>

            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {product.category && (
                <p style={{ fontSize: 12, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  {product.category}
                </p>
              )}
              <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, marginBottom: 10 }}>{product.name}</h1>
              <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>${product.price.toFixed(2)}</p>
              <p style={{ fontSize: 12, color: product.stock > 0 ? "#4ade80" : "#f87171", marginBottom: "1.5rem" }}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>

              {/* Size selector */}
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: 12, color: sizeError ? "#f87171" : "#555", marginBottom: 10, transition: "color 0.15s" }}>
                  {sizeError ? "Please select a size" : "Select size"}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SIZES.map(size => (
                    <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }} style={{
                      width: 44, height: 44,
                      background: selectedSize === size ? "#fff" : "#1a1a1a",
                      color: selectedSize === size ? "#000" : "#fff",
                      border: `1px solid ${sizeError ? "#3d1515" : selectedSize === size ? "#fff" : "#2a2a2a"}`,
                      borderRadius: 8, cursor: "pointer",
                      fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { if (selectedSize !== size) (e.currentTarget.style.borderColor = "#555"); }}
                      onMouseLeave={e => { if (selectedSize !== size) (e.currentTarget.style.borderColor = sizeError ? "#3d1515" : "#2a2a2a"); }}
                    >{size}</button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>Quantity</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                    width: 36, height: 36, background: "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 8,
                    color: "#fff", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                  >−</button>
                  <span style={{ fontSize: 15, fontWeight: 500, minWidth: 24, textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => product && q < product.stock ? q + 1 : q)} style={{
                    width: 36, height: 36, background: "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 8,
                    color: "#fff", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                  >+</button>
                </div>
              </div>

              {/* Add to cart */}
              <button onClick={addToCart} disabled={product.stock === 0} style={{
                padding: "13px", width: "100%",
                background: added ? "#0f2a0f" : product.stock === 0 ? "#1a1a1a" : "#fff",
                color: added ? "#4ade80" : product.stock === 0 ? "#555" : "#000",
                border: `1px solid ${added ? "#1a4a1a" : "transparent"}`,
                borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (!added && product.stock > 0) (e.currentTarget.style.background = "#e8e8e8"); }}
                onMouseLeave={e => { if (!added && product.stock > 0) (e.currentTarget.style.background = "#fff"); }}
              >
                {added ? "Added to cart!" : product.stock === 0 ? "Out of stock" : `Add ${quantity} to cart`}
              </button>

              <button onClick={() => router.push("/cart")} style={{
                marginTop: 10, padding: "11px", width: "100%",
                background: "transparent", color: "#555",
                border: "1px solid #2a2a2a", borderRadius: 10,
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget.style.color = "#fff"); (e.currentTarget.style.borderColor = "#555"); }}
                onMouseLeave={e => { (e.currentTarget.style.color = "#555"); (e.currentTarget.style.borderColor = "#2a2a2a"); }}
              >
                View cart
              </button>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ marginTop: "3rem", borderTop: "1px solid #2a2a2a", paddingTop: "2rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Reviews</h2>
              {reviews.length > 0 && (
                <p style={{ fontSize: 13, color: "#555" }}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} avg · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              )}
            </div>

            {/* Write a review */}
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Write a review</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: 28, cursor: "pointer",
                      color: star <= (hoverRating || rating) ? "#facc15" : "#2a2a2a",
                      transition: "color 0.1s",
                    }}
                  >★</span>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts on this product..."
                rows={3} style={{
                  width: "100%", padding: "10px 12px",
                  background: "#111", border: "1px solid #2a2a2a",
                  borderRadius: 10, color: "#fff", fontSize: 14,
                  outline: "none", fontFamily: "inherit", resize: "vertical",
                  marginBottom: 12, boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "#555"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"}
              />
              {reviewError && <p style={{ fontSize: 13, color: "#f87171", marginBottom: 10 }}>{reviewError}</p>}
              <button onClick={submitReview} disabled={submitting} style={{
                padding: "10px 24px",
                background: submitted ? "#0f2a0f" : submitting ? "#333" : "#fff",
                color: submitted ? "#4ade80" : submitting ? "#888" : "#000",
                border: submitted ? "1px solid #1a4a1a" : "none",
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
              }}>
                {submitted ? "Review submitted!" : submitting ? "Submitting..." : "Submit review"}
              </button>
            </div>

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p style={{ color: "#555", fontSize: 14 }}>No reviews yet — be the first!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} style={{
                  background: "#1a1a1a", border: "1px solid #2a2a2a",
                  borderRadius: 14, padding: "1.25rem", marginBottom: 10,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "#2a2a2a", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 13, fontWeight: 600,
                        }}>
                          {review.userName?.[0]?.toUpperCase()}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{review.userName}</p>
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} style={{ fontSize: 14, color: star <= review.rating ? "#facc15" : "#2a2a2a" }}>★</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: "#555" }}>
                      {review.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                    </p>
                  </div>
                  <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6, marginTop: 8 }}>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}