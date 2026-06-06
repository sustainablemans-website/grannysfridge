"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { Item, Location, getDaysUntilExpiry, getExpiryStatus } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [ir, lr] = await Promise.all([
      fetch("/api/items"), fetch("/api/locations")
    ]);
    if (ir.ok) setItems(await ir.json());
    if (lr.ok) setLocations(await lr.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (status === "authenticated") fetchAll(); }, [status, fetchAll]);

  const handleSaveItem = async (data: any) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed");
    await fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個物品嗎？")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const expiredItems = items.filter(i => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "expired");
  const criticalItems = items.filter(i => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "critical");
  const warningItems = items.filter(i => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "warning");
  const okItems = items.filter(i => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "ok");

  const stats = [
    { label: "物品總數", value: items.length, icon: "", color: "var(--accent)" },
    { label: "即將到期", value: criticalItems.length + warningItems.length, icon: "", color: "var(--yellow)" },
    { label: "已過期", value: expiredItems.length, icon: "", color: "var(--red)" },
    { label: "存放空間", value: locations.length, icon: "", color: "var(--green)" },
  ];

  if (status === "loading" || loading) return (
    <div className="page-layout">
      <Navigation />
      <main className="main-content">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      </main>
    </div>
  );

  return (
    <div className="page-layout">
      <Navigation />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
               嗨，{session?.user?.name}！
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
              你的冰箱現在有 <strong style={{ color: "var(--accent)" }}>{items.length}</strong> 件物品
            </p>
          </div>
          <button id="add-item-btn" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
             新增物品
          </button>
        </div>

        {/* Stats */}
        <div className="grid-2" style={{ marginBottom: 32, gridTemplateColumns: "repeat(4,1fr)" }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {expiredItems.length > 0 && (
          <div style={{ background:"var(--red-glow)", border:"1px solid rgba(248,81,73,0.3)", borderRadius:"var(--radius-lg)", padding:20, marginBottom:24 }}>
            <h2 style={{ color:"var(--red)", marginBottom:16, fontSize:18 }}> 已過期物品 ({expiredItems.length})</h2>
            <div className="grid-auto">
              {expiredItems.map(item => <ItemCard key={item.id} item={item} onDelete={handleDelete} />)}
            </div>
          </div>
        )}

        {criticalItems.length > 0 && (
          <div style={{ background:"var(--orange-glow)", border:"1px solid rgba(240,136,62,0.3)", borderRadius:"var(--radius-lg)", padding:20, marginBottom:24 }}>
            <h2 style={{ color:"var(--orange)", marginBottom:16, fontSize:18 }}> 緊急到期（2天內）({criticalItems.length})</h2>
            <div className="grid-auto">
              {criticalItems.map(item => <ItemCard key={item.id} item={item} onDelete={handleDelete} />)}
            </div>
          </div>
        )}

        {/* Location map */}
        {locations.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}> 存放空間</h2>
            <div className="grid-3">
              {locations.map(loc => {
                const locItems = items.filter(i => i.locationId === loc.id);
                return (
                  <div key={loc.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <span style={{ fontSize:24 }}>{loc.icon ?? ""}</span>
                      <div>
                        <div style={{ fontWeight:600 }}>{loc.name}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>{locItems.length} 件物品</div>
                      </div>
                    </div>
                    {locItems.slice(0,3).map(item => (
                      <ItemCard key={item.id} item={item} compact />
                    ))}
                    {locItems.length > 3 && (
                      <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:8 }}>
                        還有 {locItems.length - 3} 件...
                      </p>
                    )}
                    {locItems.length === 0 && (
                      <p style={{ fontSize:13, color:"var(--text-muted)", textAlign:"center" }}>空的</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All ok items */}
        {okItems.length > 0 && (
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}> 狀態良好 ({okItems.length})</h2>
            <div className="grid-auto">
              {okItems.map(item => <ItemCard key={item.id} item={item} onDelete={handleDelete} />)}
            </div>
          </section>
        )}

        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>冰箱是空的！</h3>
            <p>點擊「新增物品」開始管理你的食材與物品</p>
            <button id="empty-add-btn" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
               新增第一件物品
            </button>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddItemModal locations={locations} onClose={() => setShowAddModal(false)} onSave={handleSaveItem} />
      )}
    </div>
  );
}