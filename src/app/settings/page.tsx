"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Copy, RefreshCw, Unlink, CheckCircle, XCircle, Loader } from "lucide-react";


export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // LINE state
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [lineCode, setLineCode] = useState<string | null>(null);
  const [lineLoading, setLineLoading] = useState(true);
  const [lineCodeLoading, setLineCodeLoading] = useState(false);

  // Discord state
  const [discordUrl, setDiscordUrl] = useState("");
  const [discordSaving, setDiscordSaving] = useState(false);
  const [discordSaved, setDiscordSaved] = useState(false);
  const [discordTesting, setDiscordTesting] = useState(false);

  // Cron state
  const [cronResult, setCronResult] = useState<string | null>(null);
  const [cronLoading, setCronLoading] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status, router]);

  // --- Fetch current LINE + Discord status ---
  const fetchLineStatus = useCallback(async () => {
    setLineLoading(true);
    try {
      const res = await fetch("/api/line/connect");
      if (res.ok) {
        const data = await res.json();
        setLineUserId(data.lineUserId);
        setLineCode(data.lineConnectCode);
      }
    } finally {
      setLineLoading(false);
    }
  }, []);

  const fetchDiscordStatus = useCallback(async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    const res = await fetch(`/api/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setDiscordUrl(data.discordWebhookUrl || "");
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLineStatus();
      fetchDiscordStatus();
    }
  }, [status, fetchLineStatus, fetchDiscordStatus]);

  // --- LINE handlers ---
  const generateLinkCode = async () => {
    setLineCodeLoading(true);
    try {
      const res = await fetch("/api/line/connect", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLineCode(data.code);
      }
    } finally {
      setLineCodeLoading(false);
    }
  };

  const unlinkLine = async () => {
    if (!confirm("確定要解除 LINE 連結嗎？")) return;
    await fetch("/api/line/connect", { method: "DELETE" });
    setLineUserId(null);
    setLineCode(null);
  };

  const copyCode = () => {
    if (lineCode) navigator.clipboard.writeText(lineCode);
  };

  // Poll for connection while code is pending
  useEffect(() => {
    if (!lineCode || lineUserId) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/line/connect");
      if (res.ok) {
        const data = await res.json();
        if (data.lineUserId) {
          setLineUserId(data.lineUserId);
          setLineCode(null);
          clearInterval(interval);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lineCode, lineUserId]);

  // --- Discord handlers ---
  const saveDiscord = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscordSaving(true);
    const userId = (session?.user as any)?.id;
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordWebhookUrl: discordUrl || null }),
    });
    setDiscordSaving(false);
    setDiscordSaved(true);
    setTimeout(() => setDiscordSaved(false), 3000);
  };

  const testDiscord = async () => {
    if (!discordUrl) return alert("請先輸入 Discord Webhook URL 並儲存");
    setDiscordTesting(true);
    try {
      const res = await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🍎 阿嬤的冰箱 - Discord 測試",
            description: "Discord Webhook 連線測試成功！排程到期提醒將會發送至此頻道。",
            color: 0x4A9EFF,
            footer: { text: "阿嬤的冰箱 智能管家" },
            timestamp: new Date().toISOString()
          }]
        })
      });
      alert(res.ok ? "✅ 測試發送成功！請查看您的 Discord 頻道" : "❌ 發送失敗，請確認 Webhook URL");
    } finally {
      setDiscordTesting(false);
    }
  };

  // --- Cron test (uses authenticated endpoint, no CRON_SECRET in frontend) ---
  const testCron = async () => {
    setCronLoading(true);
    setCronResult(null);
    try {
      const res = await fetch("/api/cron/trigger", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setCronResult(`❌ 錯誤 (${res.status}): ${data.error || "未知錯誤"}`);
      } else if (data.notified === 0) {
        setCronResult("ℹ️ 排程執行成功，但目前沒有符合提醒條件的物品（確認是否有設定到期日且在提醒天數內）。");
      } else {
        setCronResult(`✅ 成功！已傳送 ${data.notified} 筆提醒通知。${data.errors?.length ? `\n⚠️ 錯誤: ${data.errors.join(", ")}` : ""}`);
      }
    } catch (e: any) {
      setCronResult(`❌ 執行失敗: ${e.message}`);
    } finally {
      setCronLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Navigation />
      <main className="main-content">
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🔔 通知設定</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>設定到期提醒，讓阿嬤給你溫暖提醒！</p>

        <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* =========================== LINE Section =========================== */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>💬</span>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>LINE 訊息推播</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>加入 LINE 機器人好友，自動接收食材到期通知</p>
              </div>
            </div>

            {lineLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", padding: "16px 0" }}>
                <Loader size={16} className="animate-spin" /> 讀取連結狀態...
              </div>
            ) : lineUserId ? (
              /* ---- CONNECTED STATE ---- */
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--green-glow, rgba(48,199,123,0.1))", borderRadius: 10, border: "1px solid var(--green, #30c77b)", marginTop: 16 }}>
                  <CheckCircle size={20} color="var(--green, #30c77b)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--green, #30c77b)" }}>LINE 帳號已連結！</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>將自動傳送到期提醒至您的 LINE</div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={unlinkLine}>
                    <Unlink size={14} style={{ marginRight: 4 }} />解除連結
                  </button>
                </div>
              </div>
            ) : lineCode ? (
              /* ---- CODE PENDING STATE ---- */
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
                  請先加入 LINE 機器人好友，然後將以下連結碼傳送給機器人完成綁定：
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", margin: "20px 0" }}>
                  <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: 10, fontFamily: "monospace", background: "var(--bg-base)", padding: "16px 24px", borderRadius: 12, border: "2px dashed var(--accent)" }}>
                    {lineCode}
                  </div>
                  <button className="btn-icon" onClick={copyCode} title="複製">
                    <Copy size={18} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", background: "var(--bg-base)", padding: 12, borderRadius: 8 }}>
                  <Loader size={14} style={{ animation: "spin 1.5s linear infinite" }} />
                  等待 LINE 機器人收到連結碼後自動完成綁定...
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={generateLinkCode} disabled={lineCodeLoading}>
                    <RefreshCw size={14} style={{ marginRight: 6 }} />重新產生連結碼
                  </button>
                </div>
              </div>
            ) : (
              /* ---- NOT CONNECTED STATE ---- */
              <div style={{ marginTop: 16 }}>
                <ol style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 2.0, paddingLeft: 20 }}>
                  <li>掃描或搜尋 LINE 機器人並加為好友</li>
                  <li>點擊下方「產生連結碼」取得 6 位數代碼</li>
                  <li>將代碼傳訊息給 LINE 機器人即可完成綁定</li>
                </ol>
                <button className="btn btn-primary" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }} onClick={generateLinkCode} disabled={lineCodeLoading}>
                  {lineCodeLoading ? <Loader size={16} /> : "💬"} 產生連結碼並開始連結
                </button>
              </div>
            )}
          </div>

          {/* =========================== Discord Section =========================== */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>🎮</span>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Discord Webhook</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>在 Discord 頻道設定中建立 Webhook 並貼上網址</p>
              </div>
            </div>
            <form onSubmit={saveDiscord} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="discord-url">Discord Webhook URL</label>
                <input id="discord-url" className="form-input" type="url" placeholder="https://discord.com/api/webhooks/..." value={discordUrl} onChange={e => setDiscordUrl(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={discordSaving}>
                  {discordSaving ? "儲存中..." : "✅ 儲存"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={testDiscord} disabled={discordTesting}>
                  {discordTesting ? "發送中..." : "🧪 測試發送"}
                </button>
                {discordSaved && <span style={{ color: "var(--green)", alignSelf: "center", fontSize: 14 }}>✔ 已儲存！</span>}
              </div>
            </form>
          </div>

          {/* =========================== Cron Section =========================== */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>⏰</span>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>自動提醒排程</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>每天自動檢查即將到期的物品並發送通知</p>
              </div>
            </div>
            <button id="test-cron-btn" className="btn btn-secondary" onClick={testCron} disabled={cronLoading} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {cronLoading ? <><Loader size={16} /> 執行中...</> : "▶ 立即測試發送"}
            </button>
            {cronResult && (
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "var(--bg-base)", border: `1px solid var(--border)`, fontSize: 14, whiteSpace: "pre-line", lineHeight: 1.8 }}>
                {cronResult}
              </div>
            )}
            <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "var(--bg-base)", fontSize: 13, color: "var(--text-muted)" }}>
              💡 提示：物品需設定「到期日」且剩餘天數在「提醒天數」以內，才會觸發通知。
            </div>
          </div>

          {/* =========================== Webhook URL hint =========================== */}
          <div className="card" style={{ padding: 24, border: "1px dashed var(--border)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📡 LINE Bot Webhook 設定</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8 }}>
              如果要啟用 LINE 自動加好友連結功能，請到 LINE Developers Console 的 Messaging API 設定中，
              將 Webhook URL 設定為：
            </p>
            <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--bg-base)", borderRadius: 8, fontFamily: "monospace", fontSize: 13, color: "var(--accent)", overflowX: "auto" }}>
              https://&#123;您的網域&#125;/api/line/webhook
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              ⚠️ 本機開發時 LINE 無法連到 localhost，需部署至正式網域後才能使用自動連結功能。
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}