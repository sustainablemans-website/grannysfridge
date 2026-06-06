"use client";
import { Item, getDaysUntilExpiry, getExpiryStatus } from "@/types";
import { format } from "date-fns";

interface Props {
  item: Item;
  onEdit?: (item: Item) => void;
  onDelete?: (id: string) => void;
  onConsume?: (id: string) => void;
  compact?: boolean;
}

const statusConfig = {
  ok:       { label: "Good",    cls: "badge-ok" },
  warning:  { label: "Warning", cls: "badge-warning" },
  critical: { label: "Urgent",  cls: "badge-critical" },
  expired:  { label: "Expired", cls: "badge-expired" },
};

export function ItemCard({ item, onEdit, onDelete, onConsume, compact }: Props) {
  const days = getDaysUntilExpiry(item.expiryDate);
  const status = getExpiryStatus(days);
  const cfg = statusConfig[status];
  const borderColor = status === "expired" ? "var(--red)" : status === "critical" ? "var(--orange)" : status === "warning" ? "var(--yellow)" : "var(--border)";

  return (
    <div id={`item-card-${item.id}`} className="card animate-fade-in"
      style={{ padding: compact ? "12px" : "16px", borderColor, position: "relative", overflow: "hidden" }}
    >
      {(status === "critical" || status === "expired") && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: status === "expired" ? "var(--red)" : "var(--orange)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name}
            style={{ width: 56, height: 56, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "var(--radius-sm)", flexShrink: 0,
            background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            {item.barcode ? "" : ""}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name}
            </h3>
            <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            {item.location && <span style={{ fontSize: 12, color: "var(--text-muted)" }}> {(item.location as any).name}</span>}
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>x{item.quantity}{item.unit}</span>
          </div>
          {item.expiryDate && (
            <div style={{ marginTop: 6, fontSize: 12 }}>
              <span style={{ color: "var(--text-muted)" }}>Exp: </span>
              <span style={{ fontWeight: 500, color: days !== null && days <= 7 ? "var(--orange)" : "var(--text-secondary)" }}>
                {format(new Date(item.expiryDate as string), "yyyy/MM/dd")}
              </span>
              {days !== null && (
                <span style={{ marginLeft: 6, fontWeight: 600,
                  color: days < 0 ? "var(--red)" : days <= 2 ? "var(--orange)" : days <= 7 ? "var(--yellow)" : "var(--green)" }}>
                  {days < 0 ? `(${Math.abs(days)}d ago)` : days === 0 ? "(today!)" : `(${days}d)`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {!compact && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          {onConsume && <button id={`consume-${item.id}`} className="btn btn-secondary btn-sm" onClick={() => onConsume(item.id)} style={{ flex: 1, justifyContent: "center" }}>Used</button>}
          {onEdit && <button id={`edit-${item.id}`} className="btn btn-secondary btn-sm" onClick={() => onEdit(item)} style={{ flex: 1, justifyContent: "center" }}>Edit</button>}
          {onDelete && <button id={`delete-${item.id}`} className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)} style={{ flexShrink: 0 }}>Del</button>}
        </div>
      )}
    </div>
  );
}