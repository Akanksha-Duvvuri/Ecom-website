"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
};

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: { name: string; quantity: number; price: number }[];
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", street: "", city: "", zip: "", country: "" });
  const [tab, setTab] = useState<"profile" | "orders">("profile");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }

      // Load profile
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          zip: data.address?.zip || "",
          country: data.address?.country || "",
        });
      }

      // Load orders
      const q = query(
        collection(db, "orders"),
        where("shipping.email", "==", user.email),
        orderBy("createdAt", "desc")
      );
      const orderSnap = await getDocs(q);
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await updateDoc(doc(db, "users", profile.uid), {
      name: form.name,
      phone: form.phone,
      address: {
        street: form.street,
        city: form.city,
        zip: form.zip,
        country: form.country,
      },
    });
    setProfile({ ...profile, name: form.name, phone: form.phone, address: { street: form.street, city: form.city, zip: form.zip, country: form.country } });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  if (!profile) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555", fontSize: 14 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1rem", color: "#fff" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <h3 style={{
                fontSize: 30, fontWeight: 700, color: "grey",
                marginBottom: "1.5rem", letterSpacing: "-0.01em",
              }}>
                TurNext <span style={{ color: "#666" }}>{">_"}</span>
                <span style={{
                  display: "inline-block", width: 2, height: 25, margin: 20,
                  background: "#fff", marginLeft: 3, verticalAlign: "middle",
                  animation: "blink 1.2s ease-in-out infinite",
                }} />
              </h3>

               <style>{`
                    @keyframes blink {
                      0%, 100% { opacity: 1; }
                      20% { opacity: 0; }
                    }
              `}</style>
          <button onClick={handleSignOut} style={{
            padding: "7px 14px", background: "transparent", color: "#555",
            border: "1px solid #2a2a2a", borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontFamily: "inherit", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = "#fff"; (e.target as HTMLButtonElement).style.borderColor = "#555"; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = "#555"; (e.target as HTMLButtonElement).style.borderColor = "#2a2a2a"; }}
          >
            Sign out
          </button>
        </div>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#2a2a2a", border: "1px solid #3a3a3a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 600, color: "#fff",
          }}>
            {profile.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>{profile.name}</p>
            <p style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{profile.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: "#111",
          borderRadius: 10, padding: 4, marginBottom: "1.5rem",
        }}>
          {(["profile", "orders"] as const).map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "7px", fontSize: 13, fontWeight: 500,
              textAlign: "center", borderRadius: 7, cursor: "pointer",
              background: tab === t ? "#2a2a2a" : "transparent",
              color: tab === t ? "#fff" : "#555",
              transition: "all 0.15s", userSelect: "none",
            }}>
              {t === "profile" ? "Profile" : "Orders"}
            </div>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>Personal info</p>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{
                  padding: "5px 12px", background: "transparent", color: "#aaa",
                  border: "1px solid #2a2a2a", borderRadius: 7, cursor: "pointer",
                  fontSize: 12, fontFamily: "inherit",
                }}>Edit</button>
              )}
            </div>

            {editing ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Display name" value={form.name} onChange={set("name")} placeholder="Your name" />
                  <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="+1 234 567 8900" />
                </div>
                <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", margin: "1rem 0 10px" }}>Shipping address</p>
                <Field label="Street" value={form.street} onChange={set("street")} placeholder="123 Main St" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="City" value={form.city} onChange={set("city")} placeholder="New York" />
                  <Field label="ZIP" value={form.zip} onChange={set("zip")} placeholder="10001" />
                </div>
                <Field label="Country" value={form.country} onChange={set("country")} placeholder="United States" />

                <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 1, padding: 11, background: saving ? "#333" : "#fff",
                    color: saving ? "#888" : "#000", border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                  }}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button onClick={() => setEditing(false)} style={{
                    padding: "11px 20px", background: "transparent", color: "#555",
                    border: "1px solid #2a2a2a", borderRadius: 10, cursor: "pointer",
                    fontSize: 14, fontFamily: "inherit",
                  }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                {[
                  ["Display name", profile.name],
                  ["Email", profile.email],
                  ["Phone", profile.phone || "Not set"],
                  ["Address", profile.address?.street ? `${profile.address.street}, ${profile.address.city}, ${profile.address.zip}, ${profile.address.country}` : "Not set"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2a2a2a" }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{label}</span>
                    <span style={{ fontSize: 13, color: value === "Not set" ? "#333" : "#fff" }}>{value}</span>
                  </div>
                ))}
              </>
            )}

            {saved && (
              <p style={{ fontSize: 13, color: "#4ade80", marginTop: 12, textAlign: "center" }}>
                Changes saved!
              </p>
            )}
          </div>
        )}

        {/* Orders tab */}
        {tab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#555", fontSize: 14 }}>No orders yet.</p>
                <button onClick={() => router.push("/")} style={{
                  marginTop: 12, padding: "9px 20px", background: "#fff", color: "#000",
                  border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                }}>Start shopping</button>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.25rem", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 100,
                        background: order.status === "paid" ? "#0f2a0f" : "#1a1a0f",
                        color: order.status === "paid" ? "#4ade80" : "#facc15",
                        border: `1px solid ${order.status === "paid" ? "#1a4a1a" : "#3a3a0f"}`,
                      }}>
                        {order.status === "paid" ? "Paid" : "Pending"}
                      </span>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>${order.total?.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", padding: "4px 0" }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking */}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#111", borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Tracking</p>
                    <div style={{ display: "flex", gap: 0 }}>
                      {["Order placed", "Processing", "Shipped", "Delivered"].map((step, i) => {
                        const activeStep = order.status === "paid" ? 1 : 0;
                        const isActive = i <= activeStep;
                        return (
                          <div key={step} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{
                              width: 10, height: 10, borderRadius: "50%", margin: "0 auto 4px",
                              background: isActive ? "#fff" : "#2a2a2a",
                              border: `1px solid ${isActive ? "#fff" : "#3a3a3a"}`,
                            }} />
                            <p style={{ fontSize: 10, color: isActive ? "#aaa" : "#333" }}>{step}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ height: 1, background: "#2a2a2a", margin: "-18px 5% 0", width: "90%", position: "relative", zIndex: 0 }} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 5 }}>{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder}
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