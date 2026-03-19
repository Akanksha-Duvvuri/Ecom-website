"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
  stock: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    address: "", city: "", zip: "", country: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

const handleSubmit = async () => {
  if (!form.firstName || !form.email || !form.address) {
    setError("Please fill in all required fields.");
    return;
  }
  localStorage.setItem("shipping", JSON.stringify(form));
  router.push("/payment");
};

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1rem", color: "#fff" }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: "2rem" }}>
        TurNext <span style={{ color: "#555" }}>›_</span>
      </p>

      {/* Steps */}
      <div style={{ display: "flex", gap: 6, fontSize: 12, marginBottom: "2rem", color: "#555" }}>
        {["Cart", "Shipping", "Payment", "Confirm"].map((s, i) => (
          <span key={s} style={{ color: i === 1 ? "#fff" : "#555", fontWeight: i === 1 ? 500 : 400 }}>
            {i > 0 && <span style={{ marginRight: 6 }}>›</span>}{s}
          </span>
        ))}
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: "1.75rem" }}>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", maxWidth: 900 }}>
        <div>
          {/* Shipping */}
          <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Shipping info</p>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="First name" placeholder="" value={form.firstName} onChange={set("firstName")} />
              <Field label="Last name" placeholder="" value={form.lastName} onChange={set("lastName")} />
            </div>
            <Field label="Email" type="email" placeholder="" value={form.email} onChange={set("email")} />
            <Field label="Address" placeholder="" value={form.address} onChange={set("address")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="City" placeholder=" " value={form.city} onChange={set("city")} />
              <Field label="ZIP" placeholder="" value={form.zip} onChange={set("zip")} />
            </div>
          </div>

          {error && (
            <p style={{ color: "#f87171", background: "#1f0a0a", border: "1px solid #3d1515", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 13 }}>
              {error}
            </p>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: 13,
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
            {loading ? "Processing..." : `Place order — $${total.toFixed(2)}`}
          </button>
        </div>

        {/* Order summary */}
        <div>
          <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Order summary</p>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem" }}>
            {cart.length === 0 && <p style={{ fontSize: 13, color: "#555" }}>Your cart is empty.</p>}
            {cart.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <img src={item.img} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", background: "#2a2a2a" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>x{item.quantity}</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <hr style={{ border: "none", borderTop: "1px solid #2a2a2a", margin: "14px 0" }} />
            {[["Subtotal", `$${total.toFixed(2)}`], ["Shipping", "Free"], ["Tax", "$0.00"]].map(([k, v]) => (
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
  );
}

function Field({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 5 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          width: "100%", padding: "10px 12px", background: "#111",
          border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff",
          fontSize: 14, outline: "none", fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = "#555"}
        onBlur={e => e.target.style.borderColor = "#2a2a2a"}
      />
    </div>
  );
}