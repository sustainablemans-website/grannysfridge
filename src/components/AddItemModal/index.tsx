"use client";
import React, { useState, useMemo } from "react";
import { Location, Item } from "@/types";
import { useLanguage } from "@/store/LanguageContext";
import { StorageVisualizer } from "@/components/StorageVisualizer";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Camera, ImagePlus } from "lucide-react";

interface Props {
  initialData?: Item;
  locations: Location[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function AddItemModal({ initialData, locations, onClose, onSave }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: initialData?.name || "", 
    barcode: initialData?.barcode || "", 
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate as any).toISOString().split('T')[0] : "", 
    reminderDays: initialData?.reminderDays ?? 3,
    quantity: initialData?.quantity ?? 1, 
    unit: initialData?.unit || "pcs", 
    notes: initialData?.notes || "", 
    locationId: initialData?.locationId || "", 
    regionId: initialData?.regionId || "", 
    imageUrl: initialData?.imageUrl || "",
  });
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const fetchBarcodeContent = async (code: string) => {
    setScanning(true);
    try {
      const res = await fetch(`/api/barcode/${code}`);
      if (res.ok) {
        const p = await res.json();
        if (p.product_name) set("name", p.product_name);
        if (p.image_url) set("imageUrl", p.image_url);
      } else {
        alert("查無此條碼商品，請手動輸入");
      }
    } finally { setScanning(false); }
  };

  const handleManualFetchBarcode = () => {
    if (!form.barcode) return;
    fetchBarcodeContent(form.barcode);
  };

  const handleScanSuccess = (code: string) => {
    set("barcode", code);
    setShowScanner(false);
    fetchBarcodeContent(code);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        set("imageUrl", data.imageUrl);
      } else {
        alert("上傳失敗");
      }
    } catch {
      alert("上傳錯誤");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(t("modal.errorFillName")); return; }
    setLoading(true); setError("");
    try {
      await onSave({
        ...form,
        quantity: Number(form.quantity),
        reminderDays: Number(form.reminderDays),
        expiryDate: form.expiryDate || null,
        locationId: form.locationId || null,
        regionId: form.regionId || null,
        imageUrl: form.imageUrl || null,
      });
      onClose();
    } catch { setError(t("modal.errorSave")); setLoading(false); }
  };

  const selectedLocation = useMemo(() => {
    const loc = locations.find(l => l.id === form.locationId);
    // If user changes location, reset regionId automatically
    if (form.locationId) {
      if (loc && !loc.imageTemplate) {
        if (form.regionId !== "") setForm(f => ({...f, regionId: ""}));
      }
    }
    return loc;
  }, [form.locationId, form.regionId, locations]);

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box" style={{ maxWidth: 880 }}>
          <div className="modal-header">
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{initialData ? "編輯物品" : t("modal.addItem")}</h2>
            <button id="close-modal-btn" className="btn-icon" onClick={onClose}>X</button>
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: 32, padding: 24, flexWrap: "wrap" }}>
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 320 }}>
              {error && <p style={{ color:"var(--red)",fontSize:13,padding:"8px 12px",background:"var(--red-glow)",borderRadius:8 }}>{error}</p>}
              
              <div style={{ display:"flex", gap:8, alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex:1 }}>
                  <label className="form-label">{t("modal.barcode")}</label>
                  <input id="barcode-input" className="form-input" placeholder={t("modal.barcode")} value={form.barcode} onChange={e => set("barcode", e.target.value)} />
                </div>
                <button type="button" className="btn btn-secondary" onClick={handleManualFetchBarcode} disabled={scanning}>{scanning ? "..." : t("modal.lookup")}</button>
                <button type="button" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px" }} onClick={() => setShowScanner(true)}>
                  <Camera size={18} /> 鏡頭掃描
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">{t("modal.itemName")} / 物品相片</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                   {form.imageUrl ? (
                     <div style={{ position: "relative" }}>
                       <img src={form.imageUrl} alt="商品" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                       <button type="button" onClick={() => set("imageUrl", "")} style={{ position: "absolute", top: -6, right: -6, background: "var(--red)", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                     </div>
                   ) : (
                     <button type="button" className="btn btn-secondary" style={{ padding: "0 12px", height: 44 }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                       {uploading ? "..." : <ImagePlus size={18} />}
                     </button>
                   )}
                   <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      ref={fileInputRef} 
                      style={{ display: "none" }} 
                      onChange={handleImageUpload} 
                   />
                   <input id="item-name-input" className="form-input" placeholder={t("modal.itemNamePlaceholder")} required value={form.name} onChange={e => set("name", e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t("modal.quantity")}</label>
                  <input id="quantity-input" className="form-input" type="number" min={1} value={form.quantity} onChange={e => set("quantity", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("modal.unit")}</label>
                  <input id="unit-input" className="form-input" placeholder={t("modal.unitPlaceholder")} value={form.unit} onChange={e => set("unit", e.target.value)} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t("modal.expiryDate")}</label>
                  <input id="expiry-input" className="form-input" type="date" value={form.expiryDate} onChange={e => set("expiryDate", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("modal.reminderDays")}</label>
                  <input id="reminder-input" className="form-input" type="number" min={0} max={30} value={form.reminderDays} onChange={e => set("reminderDays", e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t("modal.location")}</label>
                <select id="location-select" className="form-select" value={form.locationId} onChange={e => { set("locationId", e.target.value); set("regionId", ""); }}>
                  <option value="">{t("modal.locationNotSpecified")}</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t("modal.notes")}</label>
                <textarea id="notes-input" className="form-textarea" placeholder={t("modal.notesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} />
              </div>

              <div className="modal-footer" style={{ marginTop: 24, padding: 0, border: "none" }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>{t("modal.cancel")}</button>
                <button id="save-item-btn" type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? t("modal.saving") : t("modal.saveItem")}
                </button>
              </div>
            </form>

            {/* Right Column: Visualization */}
            {selectedLocation?.imageTemplate && (
              <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", background: "var(--bg-base)", padding: 24, borderRadius: 16 }}>
                <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>
                  👇 點擊指定此物品存放區域
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, textAlign: "center" }}>目前選擇：{selectedLocation.name}</p>
                <StorageVisualizer 
                  templateId={selectedLocation.imageTemplate} 
                  activeRegionId={form.regionId} 
                  onRegionClick={(id: string) => set("regionId", id)}
                />
                {!form.regionId && (
                  <div style={{ marginTop: 24, fontSize: 13, color: "var(--red)", background: "var(--red-glow)", padding: "8px 16px", borderRadius: 8, textAlign: "center" }}>
                    尚未選擇儲存位置，請點選上方圖片！
                  </div>
                )}
                {form.regionId && (
                  <div style={{ marginTop: 24, fontSize: 13, color: "var(--blue)", background: "var(--blue-glow)", padding: "8px 16px", borderRadius: 8, textAlign: "center" }}>
                    已綁定選取區域！可以儲存了。
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner 
          onScan={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </>
  );
}