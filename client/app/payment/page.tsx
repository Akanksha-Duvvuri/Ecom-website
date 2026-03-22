"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js"; // initializes stripe with my public key
import {
  Elements, //stripes context provider
  PaymentElement, //ready made payment UI component
  useStripe, //hooks to access stripe inside the form
  useElements, //same as usestripe
} from "@stripe/react-stripe-js";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";  //updatedoc - updates an existing firestore document and //increment - firestore helper to increase a number field automatically
import { db, auth } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
//loads stripe, ! tells ts that the value exists-  this is a primise(stripe loads asynchronously)

type CartItem = {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
  stock: number;
};

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState(""); //the secret key that stripe sends back starts empty until the API responds
  const [cart, setCart] = useState<CartItem[]>([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const parsedCart = JSON.parse(stored);
      setCart(parsedCart);
      const cartTotal = parsedCart.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity, 0
      );
      fetch("/api/create-payment-intent", {  //backend talks to stripe and creates a payment intent, returns clientsecret - this gets saved to state and triggers stripes payment form to render. 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal * 1.18 }),
      })
        .then(res => res.json())
        .then(data => setClientSecret(data.clientSecret));
    }
  }, []);

  return (
    <ProtectedRoute>
      <style>{`
        .payment-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }
        .payment-summary { position: sticky; top: 80px; }
        @media (max-width: 700px) {
          .payment-grid { grid-template-columns: 1fr; }
          .payment-summary { position: static; }
        }
      `}</style>

      <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1.25rem", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: "2rem" }}>
            TurNext <span style={{ color: "#555" }}>›_</span>
          </p>

          {/* Steps */}
          <div style={{ display: "flex", gap: 6, fontSize: 12, marginBottom: "2rem", flexWrap: "wrap" }}>
            {["Cart", "Shipping", "Payment", "Confirm"].map((s, i) => (
              <span key={s} style={{ color: i === 2 ? "#fff" : "#555", fontWeight: i === 2 ? 500 : 400 }}>
                {i > 0 && <span style={{ marginRight: 6 }}>›</span>}{s}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: "1.75rem" }}>Payment</h1>

          <div className="payment-grid">
            <div>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorBackground: "#111",
                        colorText: "#ffffff",
                        colorPrimary: "#ffffff",
                        borderRadius: "10px",
                        fontFamily: "inherit",
                      },
                    },
                  }}
                >
                  <PaymentForm cart={cart} total={total} />
                </Elements>
              ) : (
                <div style={{ color: "#555", fontSize: 14 }}>Loading payment...</div>
              )}
            </div>

            {/* Order summary */}
            <div className="payment-summary">
              <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Order summary</p>
              <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <img src={item.img} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", background: "#2a2a2a", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>x{item.quantity}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid #2a2a2a", margin: "14px 0" }} />
                {[
                  ["Subtotal", `$${subtotal.toFixed(2)}`],
                  ["GST (18%)", `$${gst.toFixed(2)}`],
                  ["Shipping", "Free"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 8 }}>
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid #2a2a2a", margin: "14px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600, color: "#fff" }}>
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function PaymentForm({ cart, total }: { cart: CartItem[]; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", //sends card details to stripe and redirects only if the payment method requires it. otherwise stays on the page. 
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const shipping = JSON.parse(localStorage.getItem("shipping") || "{}");
        const orderRef = await addDoc(collection(db, "orders"), {
          items: cart,
          total,
          shipping,
          status: "paid",
          paymentIntentId: paymentIntent.id,
          userId: auth.currentUser?.uid,
          userEmail: auth.currentUser?.email,
          createdAt: serverTimestamp(),
        });

        for (const item of cart) {
          const productRef = doc(db, "products", item.id);
          await updateDoc(productRef, { stock: increment(-item.quantity) });
        } //reduce stock for each item

        localStorage.removeItem("cart");
        localStorage.removeItem("shipping");
        window.dispatchEvent(new Event("cartUpdated"));
        router.push("/order-confirmation?orderId=" + orderRef.id);
      } catch (err: any) {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem" }}>
      <PaymentElement />

      {error && (
        <p style={{ color: "#f87171", background: "#1f0a0a", border: "1px solid #3d1515", borderRadius: 8, padding: "8px 12px", margin: "12px 0", fontSize: 13 }}>
          {error}
        </p>
      )}

      <button onClick={handleSubmit} disabled={loading || !stripe} style={{
        width: "100%", padding: 13, marginTop: "1.25rem",
        background: loading ? "#333" : "#fff",
        color: loading ? "#888" : "#000",
        border: "none", borderRadius: 10,
        fontSize: 14, fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit", transition: "background 0.15s",
      }}
        onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.background = "#e8e8e8"; }}
        onMouseLeave={e => { if (!loading) (e.target as HTMLButtonElement).style.background = "#fff"; }}
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
      <p style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 8 }}>
        Google Pay · Apple Pay · Card — powered by Stripe
      </p>
    </div>
  );
}