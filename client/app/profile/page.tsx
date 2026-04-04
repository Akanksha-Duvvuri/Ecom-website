"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, getDocs, doc, getDoc, updateDoc,
  addDoc, deleteDoc, serverTimestamp, orderBy, query
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
  shipping: any;
  userId: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  img: string;
  category: string;
  stock: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: any;
};

const TABS = ["analytics", "orders", "products", "users"] as const;
type Tab = typeof TABS[number];

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("analytics");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", img: "", category: "", stock: "" });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || !snap.data().isAdmin) {
        router.push("/"); return;
      }
      setAuthorized(true);
      setLoading(false);
      loadAll();
    });
    return () => unsub();
  }, []);

  const loadAll = async () => {
    const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
      getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "products")),
      getDocs(collection(db, "users")),
    ]);
    setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { status });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter(p => p.id !== id));
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);
    await updateDoc(doc(db, "products", editingProduct.id), {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      img: editingProduct.img,
      category: editingProduct.category,
      stock: Number(editingProduct.stock),
    });
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    setSaving(false);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setSaving(true);
    const ref = await addDoc(collection(db, "products"), {
      name: newProduct.name,
      price: Number(newProduct.price),
      img: newProduct.img,
      category: newProduct.category,
      stock: Number(newProduct.stock),
      createdAt: serverTimestamp(),
    });
    setProducts([...products, { id: ref.id, ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock) }]);
    setNewProduct({ name: "", price: "", img: "", category: "", stock: "" });
    setShowAddProduct(false);
    setSaving(false);
  };

  // --- Analytics calculations ---
  const paidOrders = orders.filter(o => o.status !== "cancelled");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Top products by quantity sold
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const order of paidOrders) {
    for (const item of order.items || []) {
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSales[item.id].qty += item.quantity;
      productSales[item.id].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Orders by status
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Revenue last 7 days
  const now = new Date();
  const last7 = orders.filter(o => {
    const date = o.createdAt?.toDate?.();
    if (!date) return false;
    return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  const revenue7d = last7.reduce((sum, o) => sum + (o.total || 0), 0);

  // Low stock products
  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  if (loading) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555" }}>Checking access...</p>
    </div>
  );

  if (!authorized) return null;

  const card = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "1.25rem", marginBottom: 12 };
  const input = { width: "100%", padding: "9px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 8 };
  const btn = (bg = "#fff", color = "#000") => ({ padding: "7px 14px", background: bg, color, border: bg === "transparent" ? "1px solid #2a2a2a" : "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" });

  const statCard = (label: string, value: string, sub?: string) => (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 600, marginBottom: sub ? 4 : 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#555" }}>{sub}</p>}
    </div>
  );

  return (
    <ProtectedRoute>
      <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "2rem 1.5rem", color: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700 }}>TurNext <span style={{ color: "#555" }}>›_</span></p>
              <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>Admin</h1>
            </div>
            <button onClick={() => router.push("/")} style={btn("transparent", "#555")}>
              Back to store
            </button>
          </div>

          {/* Top stats — always visible */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: "2rem" }}>
            {statCard("Total revenue", `$${totalRevenue.toFixed(2)}`)}
            {statCard("Last 7 days", `$${revenue7d.toFixed(2)}`)}
            {statCard("Total orders", `${orders.length}`, `${paidOrders.length} paid`)}
            {statCard("Avg order", `$${avgOrderValue.toFixed(2)}`)}
            {statCard("Products", `${products.length}`, `${outOfStock.length} out of stock`)}
            {statCard("Users", `${users.length}`)}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "#111", borderRadius: 10, padding: 4, marginBottom: "1.5rem" }}>
            {TABS.map(t => (
              <div key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "7px", fontSize: 13, fontWeight: 500,
                textAlign: "center", borderRadius: 7, cursor: "pointer",
                background: tab === t ? "#2a2a2a" : "transparent",
                color: tab === t ? "#fff" : "#555",
                transition: "all 0.15s", userSelect: "none" as const,
                textTransform: "capitalize" as const,
              }}>
                {t}
              </div>
            ))}
          </div>

          {/* Analytics tab */}
          {tab === "analytics" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

                {/* Top products */}
                <div style={{ ...card, marginBottom: 0 }}>
                  <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>Top products by units sold</p>
                  {topProducts.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#555" }}>No sales data yet.</p>
                  ) : (
                    topProducts.map((p, i) => (
                      <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < topProducts.length - 1 ? "1px solid #2a2a2a" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, color: "#555", minWidth: 16 }}>#{i + 1}</span>
                          <p style={{ fontSize: 13 }}>{p.name}</p>
                        </div>
                        <div style={{ textAlign: "right" as const }}>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{p.qty} sold</p>
                          <p style={{ fontSize: 11, color: "#555" }}>${p.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Order status breakdown */}
                <div style={{ ...card, marginBottom: 0 }}>
                  <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>Orders by status</p>
                  {Object.entries(statusCounts).length === 0 ? (
                    <p style={{ fontSize: 13, color: "#555" }}>No orders yet.</p>
                  ) : (
                    Object.entries(statusCounts).map(([status, count]) => {
                      const colors: Record<string, string> = {
                        paid: "#4ade80", processing: "#60a5fa",
                        shipped: "#facc15", delivered: "#a78bfa", cancelled: "#f87171",
                      };
                      return (
                        <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2a2a2a" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[status] || "#555" }} />
                            <p style={{ fontSize: 13, textTransform: "capitalize" as const }}>{status}</p>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{count}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Low stock warning */}
              {(lowStock.length > 0 || outOfStock.length > 0) && (
                <div style={{ ...card, marginBottom: 0, borderColor: "#3a1f00" }}>
                  <p style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>Stock alerts</p>
                  {outOfStock.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a2a" }}>
                      <p style={{ fontSize: 13 }}>{p.name}</p>
                      <span style={{ fontSize: 11, color: "#f87171", background: "#1f0a0a", padding: "2px 8px", borderRadius: 6, border: "1px solid #3d1515" }}>Out of stock</span>
                    </div>
                  ))}
                  {lowStock.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a2a" }}>
                      <p style={{ fontSize: 13 }}>{p.name}</p>
                      <span style={{ fontSize: 11, color: "#f97316", background: "#1a0f00", padding: "2px 8px", borderRadius: 6, border: "1px solid #3a1f00" }}>Only {p.stock} left</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders tab */}
          {tab === "orders" && (
            <div>
              {orders.length === 0 && <p style={{ color: "#555", fontSize: 14 }}>No orders yet.</p>}
              {orders.map(order => (
                <div key={order.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>Order #{order.id.slice(-8).toUpperCase()}</p>
                      <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"} · {order.shipping?.firstName} {order.shipping?.lastName}
                      </p>
                      <p style={{ fontSize: 12, color: "#555" }}>{order.shipping?.email}</p>
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>${order.total?.toFixed(2)}</p>
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        style={{ padding: "5px 10px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                      >
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

          {/* Products tab */}
          {tab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={() => setShowAddProduct(!showAddProduct)} style={btn()}>
                  {showAddProduct ? "Cancel" : "+ Add product"}
                </button>
              </div>

              {showAddProduct && (
                <div style={{ ...card, marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 12 }}>New product</p>
                  {[
                    { key: "name", placeholder: "Product name" },
                    { key: "price", placeholder: "Price (e.g. 49.99)" },
                    { key: "img", placeholder: "Image URL" },
                    { key: "category", placeholder: "Category (e.g. Hoodies)" },
                    { key: "stock", placeholder: "Stock quantity" },
                  ].map(({ key, placeholder }) => (
                    <input key={key} placeholder={placeholder}
                      value={(newProduct as any)[key]}
                      onChange={e => setNewProduct({ ...newProduct, [key]: e.target.value })}
                      style={input}
                    />
                  ))}
                  <button onClick={addProduct} disabled={saving} style={btn()}>
                    {saving ? "Adding..." : "Add product"}
                  </button>
                </div>
              )}

              {products.map(product => (
                <div key={product.id} style={card}>
                  {editingProduct?.id === product.id ? (
                    <div>
                      {[
                        { key: "name", label: "Name" },
                        { key: "price", label: "Price" },
                        { key: "img", label: "Image URL" },
                        { key: "category", label: "Category" },
                        { key: "stock", label: "Stock" },
                      ].map(({ key, label }) => (
                        <div key={key} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 3 }}>{label}</label>
                          <input
                            value={(editingProduct as any)[key]}
                            onChange={e => setEditingProduct({ ...editingProduct, [key]: e.target.value })}
                            style={input}
                          />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={saveProduct} disabled={saving} style={btn()}>
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditingProduct(null)} style={btn("transparent", "#aaa")}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {product.img && (
                        <img src={product.img} alt={product.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" as const, background: "#2a2a2a" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>{product.name}</p>
                        <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                          ${product.price} · {product.category} · {product.stock} in stock
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setEditingProduct(product)} style={btn("transparent", "#aaa")}>Edit</button>
                        <button onClick={() => deleteProduct(product.id)} style={btn("transparent", "#f87171")}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Users tab */}
          {tab === "users" && (
            <div>
              {users.map(user => (
                <div key={user.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "#2a2a2a", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 16, fontWeight: 600, flexShrink: 0,
                  }}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{user.email}</p>
                  </div>
                  <p style={{ fontSize: 11, color: "#555" }}>
                    {user.createdAt?.toDate?.()?.toLocaleDateString() || ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}