"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc, getDoc, updateDoc, collection, query,
  where, orderBy, getDocs, addDoc, deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: { street: string; city: string; zip: string; country: string; };
  wishlist?: string[];
  isAdmin?: boolean;
};

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: { name: string; quantity: number; price: number }[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  img: string;
  category: string;
  stock: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: any;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", street: "", city: "", zip: "", country: "" });
  const [tab, setTab] = useState<"profile" | "orders" | "wishlist" | "admin">("profile");
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  // Admin state
  const [adminTab, setAdminTab] = useState<"analytics" | "orders" | "products" | "users">("analytics");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", img: "", category: "", stock: "" });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }

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

        const wishlistIds: string[] = data.wishlist || [];
        if (wishlistIds.length > 0) {
          const productSnaps = await Promise.all(
            wishlistIds.map(id => getDoc(doc(db, "products", id)))
          );
          setWishlistProducts(
            productSnaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }))
          );
        }

        // Load admin data if admin
        if (data.isAdmin) {
          const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
            getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
            getDocs(collection(db, "products")),
            getDocs(collection(db, "users")),
          ]);
          setAllOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
          setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
          setAllUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser)));
        }
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
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
      name: form.name, phone: form.phone,
      address: { street: form.street, city: form.city, zip: form.zip, country: form.country },
    });
    setProfile({ ...profile, name: form.name, phone: form.phone, address: { street: form.street, city: form.city, zip: form.zip, country: form.country } });
    setSaving(false); setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 3000);
    window.showToast("Changes saved!");
  };

  const handleSignOut = async () => {
    if (profile) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      await updateDoc(doc(db, "users", profile.uid), { cart });
    }
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
    await signOut(auth);
    router.push("/login");
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  // Admin helpers
  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { status });
    setAllOrders(allOrders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter(p => p.id !== id));
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    setAdminSaving(true);
    await updateDoc(doc(db, "products", editingProduct.id), {
      name: editingProduct.name, price: Number(editingProduct.price),
      img: editingProduct.img, category: editingProduct.category, stock: Number(editingProduct.stock),
    });
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    setAdminSaving(false);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setAdminSaving(true);
    const ref = await addDoc(collection(db, "products"), {
      name: newProduct.name, price: Number(newProduct.price),
      img: newProduct.img, category: newProduct.category,
      stock: Number(newProduct.stock), createdAt: serverTimestamp(),
    });
    setProducts([...products, { id: ref.id, ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock) }]);
    setNewProduct({ name: "", price: "", img: "", category: "", stock: "" });
    setShowAddProduct(false);
    setAdminSaving(false);
  };

  // Analytics
  const paidOrders = allOrders.filter(o => (o as any).status !== "cancelled");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const now = new Date();
  const revenue7d = allOrders
    .filter(o => { const d = (o as any).createdAt?.toDate?.(); return d && (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; })
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const order of paidOrders) {
    for (const item of (order as any).items || []) {
      if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      productSales[item.id].qty += item.quantity;
      productSales[item.id].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const statusCounts = allOrders.reduce((acc, o) => { acc[(o as any).status] = (acc[(o as any).status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  if (!profile) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555", fontSize: 14 }}>Loading...</p>
    </div>
  );

  const card = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.25rem", marginBottom: 12 };
  const input = { width: "100%", padding: "9px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 8 };
  const abtn = (bg = "#fff", color = "#000") => ({ padding: "7px 14px", background: bg, color, border: bg === "transparent" ? "1px solid #2a2a2a" : "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" } as React.CSSProperties);

  const tabs = profile.isAdmin
    ? ["profile", "orders", "wishlist", "admin"] as const
    : ["profile", "orders", "wishlist"] as const;

  return (
    <ProtectedRoute>
      <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1rem", color: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: 30, fontWeight: 700, color: "grey", marginBottom: "1.5rem", letterSpacing: "-0.01em" }}>
              TurNext <span style={{ color: "#666" }}>{">_"}</span>
              <span style={{ display: "inline-block", width: 2, height: 25, margin: 20, background: "#fff", marginLeft: 3, verticalAlign: "middle", animation: "blink 1.2s ease-in-out infinite" }} />
            </h3>
            <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 20% { opacity: 0; } }`}</style>
            <button onClick={handleSignOut} style={{ padding: "7px 14px", background: "transparent", color: "#555", border: "1px solid #2a2a2a", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = "#fff"; (e.target as HTMLButtonElement).style.borderColor = "#555"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = "#555"; (e.target as HTMLButtonElement).style.borderColor = "#2a2a2a"; }}
            >Sign out</button>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#2a2a2a", border: "1px solid #3a3a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 600 }}>
              {profile.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600 }}>{profile.name}</p>
              <p style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{profile.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "#111", borderRadius: 10, padding: 4, marginBottom: "1.5rem" }}>
            {tabs.map(t => (
              <div key={t} onClick={() => setTab(t as any)} style={{
                flex: 1, padding: "7px", fontSize: 13, fontWeight: 500,
                textAlign: "center", borderRadius: 7, cursor: "pointer",
                background: tab === t ? "#2a2a2a" : "transparent",
                color: tab === t ? "#fff" : "#555",
                transition: "all 0.15s", userSelect: "none",
              }}>
                {t === "profile" ? "Profile" : t === "orders" ? "Orders" : t === "wishlist" ? "Wishlist" : "Admin"}
              </div>
            ))}
          </div>

          {/* Profile tab */}
          {tab === "profile" && (
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>Personal info</p>
                {!editing && (
                  <button onClick={() => setEditing(true)} style={{ padding: "5px 12px", background: "transparent", color: "#aaa", border: "1px solid #2a2a2a", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Edit</button>
                )}
              </div>
              {editing ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Display name" value={form.name} onChange={set("name")} placeholder="" />
                    <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="" />
                  </div>
                  <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", margin: "1rem 0 10px" }}>Shipping address</p>
                  <Field label="Street" value={form.street} onChange={set("street")} placeholder="" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="City" value={form.city} onChange={set("city")} placeholder="" />
                    <Field label="ZIP" value={form.zip} onChange={set("zip")} placeholder="" />
                  </div>
                  <Field label="Country" value={form.country} onChange={set("country")} placeholder="" />
                  <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 11, background: saving ? "#333" : "#fff", color: saving ? "#888" : "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button onClick={() => setEditing(false)} style={{ padding: "11px 20px", background: "transparent", color: "#555", border: "1px solid #2a2a2a", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
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
              {saved && <p style={{ fontSize: 13, color: "#4ade80", marginTop: 12, textAlign: "center" }}>Changes saved!</p>}
            </div>
          )}

          {/* Orders tab */}
          {tab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "2rem", textAlign: "center" }}>
                  <p style={{ color: "#555", fontSize: 14 }}>No orders yet.</p>
                  <button onClick={() => router.push("/")} style={{ marginTop: 12, padding: "9px 20px", background: "#fff", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Start shopping</button>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.25rem", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>Order #{order.id.slice(-6).toUpperCase()}</p>
                        <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{order.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: order.status === "paid" ? "#0f2a0f" : "#1a1a0f", color: order.status === "paid" ? "#4ade80" : "#facc15", border: `1px solid ${order.status === "paid" ? "#1a4a1a" : "#3a3a0f"}` }}>
                          {order.status === "paid" ? "Paid" : order.status}
                        </span>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>${order.total?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", padding: "4px 0" }}>
                          <span>{item.name} × {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Wishlist tab */}
          {tab === "wishlist" && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "2rem", textAlign: "center" }}>
                  <p style={{ color: "#555", fontSize: 14 }}>No wishlisted items yet.</p>
                  <button onClick={() => router.push("/shop")} style={{ marginTop: 12, padding: "9px 20px", background: "#fff", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Browse shop</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                  {wishlistProducts.map(product => (
                    <div key={product.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}>
                      <div onClick={() => router.push(`/items/${product.id}`)} style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#2a2a2a", cursor: "pointer" }}>
                        {product.img && <img src={product.img} alt={product.name} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{product.name}</p>
                        <p style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>${product.price}</p>
                        <button onClick={async () => {
                          if (!profile) return;
                          const { arrayRemove } = await import("firebase/firestore");
                          await updateDoc(doc(db, "users", profile.uid), { wishlist: arrayRemove(product.id) });
                          setWishlistProducts(prev => prev.filter(p => p.id !== product.id));
                        }} style={{ width: "100%", padding: "5px", background: "transparent", color: "#555", border: "1px solid #2a2a2a", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}
                          onMouseEnter={e => { (e.currentTarget.style.color = "#f87171"); (e.currentTarget.style.borderColor = "#3d1515"); }}
                          onMouseLeave={e => { (e.currentTarget.style.color = "#555"); (e.currentTarget.style.borderColor = "#2a2a2a"); }}
                        >Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin tab — only visible to admins */}
          {tab === "admin" && profile.isAdmin && (
            <div>
              {/* Admin sub-tabs */}
              <div style={{ display: "flex", gap: 4, background: "#111", borderRadius: 10, padding: 4, marginBottom: "1.5rem" }}>
                {(["analytics", "orders", "products", "users"] as const).map(t => (
                  <div key={t} onClick={() => setAdminTab(t)} style={{
                    flex: 1, padding: "7px", fontSize: 12, fontWeight: 500,
                    textAlign: "center", borderRadius: 7, cursor: "pointer",
                    background: adminTab === t ? "#2a2a2a" : "transparent",
                    color: adminTab === t ? "#fff" : "#555",
                    transition: "all 0.15s", userSelect: "none", textTransform: "capitalize",
                  }}>{t}</div>
                ))}
              </div>

              {/* Stat cards */}
              {adminTab === "analytics" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
                    {[
                      ["Total revenue", `$${totalRevenue.toFixed(2)}`],
                      ["Last 7 days", `$${revenue7d.toFixed(2)}`],
                      ["Total orders", `${allOrders.length}`],
                      ["Avg order", `$${avgOrderValue.toFixed(2)}`],
                      ["Products", `${products.length}`],
                      ["Users", `${allUsers.length}`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "0.875rem 1rem" }}>
                        <p style={{ fontSize: 10, color: "#555", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
                        <p style={{ fontSize: 22, fontWeight: 600 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div style={card}>
                      <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Top products</p>
                      {topProducts.length === 0 ? <p style={{ fontSize: 13, color: "#555" }}>No sales yet.</p> : topProducts.map((p, i) => (
                        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < topProducts.length - 1 ? "1px solid #2a2a2a" : "none" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 11, color: "#555" }}>#{i + 1}</span>
                            <p style={{ fontSize: 12 }}>{p.name}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 12, fontWeight: 500 }}>{p.qty} sold</p>
                            <p style={{ fontSize: 11, color: "#555" }}>${p.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={card}>
                      <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Orders by status</p>
                      {Object.entries(statusCounts).length === 0 ? <p style={{ fontSize: 13, color: "#555" }}>No orders yet.</p> : Object.entries(statusCounts).map(([status, count]) => {
                        const colors: Record<string, string> = { paid: "#4ade80", processing: "#60a5fa", shipped: "#facc15", delivered: "#a78bfa", cancelled: "#f87171" };
                        return (
                          <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #2a2a2a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: colors[status] || "#555" }} />
                              <p style={{ fontSize: 12, textTransform: "capitalize" }}>{status}</p>
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 500 }}>{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {(lowStock.length > 0 || outOfStock.length > 0) && (
                    <div style={{ ...card, borderColor: "#3a1f00" }}>
                      <p style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Stock alerts</p>
                      {outOfStock.map(p => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #2a2a2a" }}>
                          <p style={{ fontSize: 13 }}>{p.name}</p>
                          <span style={{ fontSize: 11, color: "#f87171", background: "#1f0a0a", padding: "2px 8px", borderRadius: 6, border: "1px solid #3d1515" }}>Out of stock</span>
                        </div>
                      ))}
                      {lowStock.map(p => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #2a2a2a" }}>
                          <p style={{ fontSize: 13 }}>{p.name}</p>
                          <span style={{ fontSize: 11, color: "#f97316", background: "#1a0f00", padding: "2px 8px", borderRadius: 6, border: "1px solid #3a1f00" }}>Only {p.stock} left</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {adminTab === "orders" && (
                <div>
                  {allOrders.length === 0 && <p style={{ color: "#555", fontSize: 14 }}>No orders yet.</p>}
                  {allOrders.map((order: any) => (
                    <div key={order.id} style={card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>Order #{order.id.slice(-8).toUpperCase()}</p>
                          <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{order.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"} · {order.shipping?.firstName} {order.shipping?.lastName}</p>
                          <p style={{ fontSize: 12, color: "#555" }}>{order.shipping?.email}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>${order.total?.toFixed(2)}</p>
                          <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                            style={{ padding: "5px 10px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", padding: "3px 0" }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === "products" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                    <button onClick={() => setShowAddProduct(!showAddProduct)} style={abtn()}>
                      {showAddProduct ? "Cancel" : "+ Add product"}
                    </button>
                  </div>
                  {showAddProduct && (
                    <div style={{ ...card, marginBottom: 20 }}>
                      <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>New product</p>
                      {[
                        { key: "name", placeholder: "Product name" },
                        { key: "price", placeholder: "Price (e.g. 49.99)" },
                        { key: "img", placeholder: "Image URL" },
                        { key: "category", placeholder: "Category" },
                        { key: "stock", placeholder: "Stock quantity" },
                      ].map(({ key, placeholder }) => (
                        <input key={key} placeholder={placeholder} value={(newProduct as any)[key]}
                          onChange={e => setNewProduct({ ...newProduct, [key]: e.target.value })} style={input} />
                      ))}
                      <button onClick={addProduct} disabled={adminSaving} style={abtn()}>{adminSaving ? "Adding..." : "Add product"}</button>
                    </div>
                  )}
                  {products.map(product => (
                    <div key={product.id} style={card}>
                      {editingProduct?.id === product.id ? (
                        <div>
                          {[{ key: "name", label: "Name" }, { key: "price", label: "Price" }, { key: "img", label: "Image URL" }, { key: "category", label: "Category" }, { key: "stock", label: "Stock" }].map(({ key, label }) => (
                            <div key={key} style={{ marginBottom: 8 }}>
                              <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 3 }}>{label}</label>
                              <input value={(editingProduct as any)[key]} onChange={e => setEditingProduct({ ...editingProduct, [key]: e.target.value })} style={input} />
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={saveProduct} disabled={adminSaving} style={abtn()}>{adminSaving ? "Saving..." : "Save"}</button>
                            <button onClick={() => setEditingProduct(null)} style={abtn("transparent", "#aaa")}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          {product.img && <img src={product.img} alt={product.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", background: "#2a2a2a" }} />}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500 }}>{product.name}</p>
                            <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>${product.price} · {product.category} · {product.stock} in stock</p>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setEditingProduct(product)} style={abtn("transparent", "#aaa")}>Edit</button>
                            <button onClick={() => deleteProduct(product.id)} style={abtn("transparent", "#f87171")}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {adminTab === "users" && (
                <div>
                  {allUsers.map(user => (
                    <div key={user.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{user.email}</p>
                      </div>
                      <p style={{ fontSize: 11, color: "#555" }}>{user.createdAt?.toDate?.()?.toLocaleDateString() || ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
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
        style={{ width: "100%", padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }}
        onFocus={e => e.target.style.borderColor = "#555"}
        onBlur={e => e.target.style.borderColor = "#2a2a2a"}
      />
    </div>
  );
}