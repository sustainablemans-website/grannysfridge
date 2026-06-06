"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Location, LocationType } from "@/types";
import { STORAGE_TEMPLATES } from "@/lib/storage-templates";
import { StorageVisualizer } from "@/components/StorageVisualizer";
import { Trash2, Edit3, Plus } from "lucide-react";

const ICONS: Record<LocationType, string> = {
  FRIDGE: "🧊", FREEZER: "❄️", CABINET: "🗄️", OTHER: "📦",
};
const TYPE_LABELS: Record<LocationType, string> = {
  FRIDGE: "冰箱冷藏", FREEZER: "冷凍庫", CABINET: "收納櫃", OTHER: "其他",
};

export default function LocationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: "", type: "FRIDGE" as LocationType, icon: "", color: "#4A9EFF",
    imageTemplate: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status, router]);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/locations");
    if (res.ok) setLocations(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (status === "authenticated") fetchLocations(); }, [status, fetchLocations]);

  const handleEditClick = (loc: Location) => {
    setForm({
      name: loc.name,
      type: loc.type,
      icon: loc.icon || "",
      color: loc.color || "#4A9EFF",
      imageTemplate: loc.imageTemplate || "",
    });
    setEditId(loc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ name:"", type:"FRIDGE", icon:"", color:"#4A9EFF", imageTemplate: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { 
      ...form, 
      icon: form.icon || ICONS[form.type],
      imageTemplate: form.imageTemplate || null
    };

    const res = await fetch(editId ? `/api/locations/${editId}` : "/api/locations", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) { 
      await fetchLocations(); 
      handleCancel();
    } else {
      alert("儲存失敗，請重試");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定刪除這個空間嗎？此動作將無法還原。")) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="page-layout">
      <Navigation />
      <main className="main-content">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:700 }}>存儲空間管理</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>管理所有分類與家具實體</p>
          </div>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display:"flex", alignItems:"center", gap: 6 }}>
              <Plus size={18} /> 新增空間
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ padding:24, marginBottom:32, border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>
              {editId ? "編輯存儲空間" : "新增存儲空間"}
            </h2>
            <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <form onSubmit={handleSave} style={{ flex: 1, display:"flex", flexDirection:"column", gap:16, minWidth: "300px" }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">空間名稱 *</label>
                    <input className="form-input" placeholder="例如：廚房雙開門冰箱" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">類型分類</label>
                    <select className="form-select" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as LocationType}))}>
                      {(Object.keys(TYPE_LABELS) as LocationType[]).map(t => (
                        <option key={t} value={t}>{ICONS[t]} {TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">連結實體家具 (選擇後此空間將轉為視覺化空間)</label>
                  <select className="form-select" value={form.imageTemplate} onChange={e => setForm(f => ({...f, imageTemplate: e.target.value}))}>
                    <option value="">（純文字分類模式）</option>
                    {Object.entries(STORAGE_TEMPLATES).map(([id, t]) => (
                      <option key={id} value={id}>🖼️ {t.name}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                    設定為視覺化家具後，未來在**「新增物品」**時，系統會自動展開此處選擇的家具圖預覽，讓您能自由綁定放入的儲存格。這裡只需要綁定大分類即可（也就是說，不用在這裡細分左門、右門、抽屜喔！）。
                  </p>
                </div>

                {!form.imageTemplate && (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">自訂圖標 (Emoji)</label>
                      <input className="form-input" placeholder={ICONS[form.type]} value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">重點標示顏色</label>
                      <input type="color" className="form-input" style={{ height:42, cursor:"pointer", padding: 4 }} value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} />
                    </div>
                  </div>
                )}

                <div style={{ display:"flex", gap:12, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>取消</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "儲存中..." : "儲存設定"}
                  </button>
                </div>
              </form>

              {form.imageTemplate && (
                <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center", background: "var(--bg-base)", padding: 24, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
                    對應實體位置預覽
                  </h3>
                  <StorageVisualizer 
                    templateId={form.imageTemplate}
                  />
                  <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)", background: "var(--bg-hover)", padding: "10px", borderRadius: 8 }}>
                    💡 這個空間綁定了完整的實體家具。未來在放入物品時，您可以透過像上方這樣的預熱圖片，直接點擊要放入的精確分層（例如第一層）。
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid-3">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:180, borderRadius:16 }} />)}
          </div>
        ) : locations.length > 0 ? (
          <div className="grid-3" style={{ gap: 24 }}>
            {locations.map(loc => {
              const matchedTemplate = loc.imageTemplate ? STORAGE_TEMPLATES[loc.imageTemplate] : null;
              
              return (
                <div key={loc.id} className="card hover-scale" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: matchedTemplate ? "1px solid var(--border)" : `1px solid var(--border)`, borderTop: matchedTemplate ? "none" : `4px solid ${loc.color ?? "var(--accent)"}` }}>
                  
                  {/* Visualizer Thumbnail Section */}
                  {matchedTemplate && (
                    <div style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 180 }}>
                       <StorageVisualizer 
                          templateId={loc.imageTemplate!} 
                          className="!w-[160px] !h-[160px] !p-0 !border-0 object-contain mx-auto"
                       />
                    </div>
                  )}

                  {/* Card Content Section */}
                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        {!matchedTemplate && (
                           <div style={{ fontSize:32, background: "var(--bg-hover)", width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                             {loc.icon ?? ICONS[loc.type as LocationType] ?? "📁"}
                           </div>
                        )}
                        <div>
                          <div style={{ fontWeight:700, fontSize:17 }}>{loc.name}</div>
                          <div style={{ fontSize:12, color:"var(--text-muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                            <span style={{ padding: "2px 8px", background: "var(--bg-hover)", borderRadius: 12 }}>{TYPE_LABELS[loc.type as LocationType] ?? loc.type}</span>
                            {matchedTemplate && <span style={{ padding: "2px 8px", background: "var(--blue-glow)", color: "var(--blue)", borderRadius: 12 }}>{matchedTemplate.name}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
                      <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight: 500 }}>
                        📦 存放 {(loc.items as any)?.length ?? 0} 件物品
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-icon" onClick={() => handleEditClick(loc)} title="編輯" style={{ color: "var(--text-secondary)" }}>
                          <Edit3 size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(loc.id)} title="刪除" style={{ color: "var(--red)" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: 40 }}>🗄️</div>
            <h3>還沒有存儲空間</h3>
            <p style={{ marginTop: 8 }}>您可以建立純文字分類的格子，或是連結視覺化的家具</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 24, padding: "10px 24px" }}>
              <Plus size={18} style={{ marginRight: 8 }}/> 立刻新增
            </button>
          </div>
        )}
      </main>
    </div>
  );
}