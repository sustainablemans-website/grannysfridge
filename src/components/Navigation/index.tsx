"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/store/LanguageContext";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: "/dashboard", icon: "refrigerator", label: t("nav.dashboard") },
    { href: "/items", icon: "package", label: t("nav.items") },
    { href: "/locations", icon: "folder", label: t("nav.locations") },
    { href: "/settings", icon: "settings", label: t("nav.settings") },
  ];

  return (
    <nav className="sidebar">
      <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{t("app.title")}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Smart Food Manager</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} id={`nav-${item.label}`}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: "var(--radius-md)", textDecoration: "none", transition: "all var(--transition)",
                background: active ? "var(--accent-glow)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                fontWeight: active ? 600 : 400, fontSize: 14 }}>
              <span>{item.icon === "refrigerator" ? "" : item.icon === "package" ? "" : item.icon === "folder" ? "" : ""}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} 
            onClick={() => setLanguage(language === "zh-TW" ? "en-US" : "zh-TW")}>
            {t("nav.language")}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session?.user?.name ?? "Guest"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Logged in</div>
          </div>
        </div>
        <button id="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}
          className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
          Logout
        </button>
      </div>
    </nav>
  );
}