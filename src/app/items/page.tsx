"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { Item, Location, getDaysUntilExpiry, getExpiryStatus } from "@/types";

type Filter = "all" | "expired" | "critical" | "warning" | "ok";

export default function ItemsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [ir, lr] = await Promise.all([fetch("/api/items"), fetch("/api/locations")]);
    if (ir.ok) setItems(await ir.json());
    if (lr.ok) setLocations(await lr.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (status === "authenticated") fetchAll(); }, [status, fetchAll]);

  const handleSaveItem = async (data: any) => {
    let savedItem: Item;
    if (editingItem) {
      const res = await fetch(`/api/items/${editingItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      savedItem = await res.json();
    } else {
      const res = await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      savedItem = await res.json();
    }
    
    // Schedule/Reschedule local notification on device
    const { scheduleLocalNotification } = await import("@/lib/localNotifications");
    const locationObj = locations.find(l => l.id === savedItem.locationId);
    await scheduleLocalNotification({
      id: savedItem.id,
      name: savedItem.name,
      expiryDate: savedItem.expiryDate ?? null,
      reminderDays: savedItem.reminderDays,
      locationName: locationObj?.name,
    });

    await fetchAll();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const closeForm = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除？")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    
    // Cancel local notification on device
    const { cancelLocalNotification } = await import("@/lib/localNotifications");
    await cancelLocalNotification(id);

    setItems(prev => prev.filter(i => i.id !== id));
  };

  const displayed = items.filter(item => {
    const s = getExpiryStatus(getDaysUntilExpiry(item.expiryDate));
    const matchFilter = filter === "all" || s === filter;
    const matchSearch = !search || item.name.includes(search);
    return matchFilter && matchSearch;
  });

  const filterBtns: { key: Filter; label: string; color: string }[] = [
    { key: "all", label: `全部 (${items.length})`, color: "var(--accent)" },
    { key: "expired", label: `過期 (${items.filter(i=>getExpiryStatus(getDaysUntilExpiry(i.expiryDate))==="expired").length})`, color: "var(--red)" },
    { key: "critical", label: `緊急 (${items.filter(i=>getExpiryStatus(getDaysUntilExpiry(i.expiryDate))==="critical").length})`, color: "var(--orange)" },
    { key: "warning", label: `警告 (${items.filter(i=>getExpiryStatus(getDaysUntilExpiry(i.expiryDate))==="warning").length})`, color: "var(--yellow)" },
    { key: "ok", label: `良好 (${items.filter(i=>getExpiryStatus(getDaysUntilExpiry(i.expiryDate))==="ok").length})`, color: "var(--green)" },
  ];

  return (
    <div className="page-layout">
      <Navigation />
      <main className="main-content">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h1 style={{ fontSize:28, fontWeight:700 }}> 物品清單</h1>
          <button id="items-add-btn" className="btn btn-primary" onClick={openAddModal}> 新增物品</button>
        </div>

        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          <input
            id="search-input"
            className="form-input"
            style={{ maxWidth:260 }}
            placeholder=" 搜尋物品名稱..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {filterBtns.map(f => (
              <button key={f.key} id={`filter-${f.key}`} onClick={() => setFilter(f.key)}
                className="btn btn-sm"
                style={{
                  background: filter===f.key ? `${f.color}22` : "var(--bg-card)",
                  color: filter===f.key ? f.color : "var(--text-secondary)",
                  border: `1px solid ${filter===f.key ? f.color : "var(--border)"}`,
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:100, borderRadius:12 }} />)}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid-auto">
            {displayed.map(item => <ItemCard key={item.id} item={item} onEdit={handleEditClick} onDelete={handleDelete} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">{search ? "" : ""}</div>
            <h3>{search ? "找不到符合的物品" : "還沒有任何物品"}</h3>
            <p>{search ? "試試其他搜尋關鍵字" : "點擊新增物品開始管理"}</p>
          </div>
        )}
      </main>
      {showAddModal && <AddItemModal initialData={editingItem || undefined} locations={locations} onClose={closeForm} onSave={handleSaveItem} />}
    </div>
  );
}