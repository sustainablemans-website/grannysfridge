import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隱私權政策 | 阿嬤的冰箱",
  description: "阿嬤的冰箱 App 隱私權政策 — 說明我們如何收集、使用及保護您的個人資料。",
};

const LAST_UPDATED = "2026-06-07";

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base, #0d1117)",
        color: "var(--text-primary, #e6edf3)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 12,
              background: "linear-gradient(135deg, #4a9eff, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            隱私權政策
          </h1>
          <p style={{ color: "var(--text-muted, #8b949e)", fontSize: 14 }}>
            最後更新日期：{LAST_UPDATED}
          </p>
        </div>

        {/* Notice Banner */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(74, 158, 255, 0.1)",
            border: "1px solid rgba(74, 158, 255, 0.3)",
            marginBottom: 40,
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--text-secondary, #b1bac4)",
          }}
        >
          💡 我們非常重視您的隱私。本政策說明《阿嬤的冰箱》如何收集、使用及保護您的個人資料。使用本 App 即表示您同意本政策的內容。
        </div>

        {/* Sections */}
        {[
          {
            emoji: "📋",
            title: "1. 我們收集哪些資料",
            content: (
              <ul style={{ paddingLeft: 20, lineHeight: 2.0, color: "var(--text-secondary, #b1bac4)" }}>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>帳號資訊：</strong>透過 Google 登入時，我們會取得您的 Email、顯示名稱及大頭貼 URL。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>LINE User ID：</strong>當您選擇連結 LINE 帳號以接收推播通知時，我們會儲存您的 LINE User ID。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>冰箱清單資料：</strong>您自行新增的物品名稱、到期日、存放位置、備註等資訊。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>物品照片：</strong>您選擇上傳的圖片（儲存於我們的伺服器）。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>通知紀錄：</strong>我們記錄推播通知的發送結果（成功/失敗），以便診斷問題。</li>
              </ul>
            ),
          },
          {
            emoji: "🎯",
            title: "2. 我們如何使用您的資料",
            content: (
              <ul style={{ paddingLeft: 20, lineHeight: 2.0, color: "var(--text-secondary, #b1bac4)" }}>
                <li>提供帳號登入與身份驗證功能。</li>
                <li>顯示您的個人冰箱清單與到期日提醒。</li>
                <li>於您設定的提醒日期，透過 LINE 或 Discord 傳送到期通知。</li>
                <li>透過條碼查詢公開的 Open Food Facts 資料庫，自動填入商品名稱。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>我們不會</strong>將您的資料用於廣告投放、出售予第三方，或任何與本 App 功能無關的用途。</li>
              </ul>
            ),
          },
          {
            emoji: "📷",
            title: "3. 相機與裝置權限",
            content: (
              <div style={{ color: "var(--text-secondary, #b1bac4)", lineHeight: 1.9 }}>
                <p>本 App 會請求以下裝置權限：</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>相機（Camera）：</strong>僅用於掃描商品條碼及拍攝物品照片。我們不會在背景錄影或錄音，也不會在您未主動開啟掃描功能時存取相機。</li>
                  <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>相簿（Photos）：</strong>您可選擇從相簿上傳現有照片作為物品圖片。</li>
                </ul>
                <p style={{ marginTop: 12 }}>所有相機使用均由您主動觸發，您可隨時在裝置設定中撤回授權。</p>
              </div>
            ),
          },
          {
            emoji: "🔗",
            title: "4. 第三方服務",
            content: (
              <div style={{ color: "var(--text-secondary, #b1bac4)", lineHeight: 1.9 }}>
                <p style={{ marginBottom: 12 }}>本 App 使用以下第三方服務，各自適用其隱私權政策：</p>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { name: "Google OAuth", desc: "帳號登入驗證", url: "https://policies.google.com/privacy" },
                    { name: "LINE Messaging API", desc: "到期提醒推播", url: "https://line.me/en/terms/policy/" },
                    { name: "Open Food Facts", desc: "條碼商品資料庫（公開資料）", url: "https://world.openfoodfacts.org/privacy" },
                    { name: "Vercel", desc: "網站與 API 主機服務", url: "https://vercel.com/legal/privacy-policy" },
                  ].map(({ name, desc, url }) => (
                    <div
                      key={name}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "var(--bg-card, rgba(255,255,255,0.03))",
                        border: "1px solid var(--border, rgba(255,255,255,0.08))",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <strong style={{ color: "var(--text-primary, #e6edf3)" }}>{name}</strong>
                        <span style={{ marginLeft: 8, fontSize: 13 }}>— {desc}</span>
                      </span>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent, #4a9eff)" }}>
                        查看政策 →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            emoji: "🗄️",
            title: "5. 資料保存與刪除",
            content: (
              <ul style={{ paddingLeft: 20, lineHeight: 2.0, color: "var(--text-secondary, #b1bac4)" }}>
                <li>您的資料儲存於安全的資料庫，僅您本人可存取。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>刪除帳號：</strong>如需刪除所有個人資料，請透過下方聯絡管道提出申請，我們將於 30 天內完成刪除。</li>
                <li><strong style={{ color: "var(--text-primary, #e6edf3)" }}>解除 LINE 連結：</strong>您可隨時在 App 的「設定」頁面解除 LINE 帳號連結，我們將立即刪除您的 LINE User ID。</li>
                <li>我們不保存條碼查詢的紀錄，查詢結果直接來自 Open Food Facts 公開 API。</li>
              </ul>
            ),
          },
          {
            emoji: "🛡️",
            title: "6. 資料安全",
            content: (
              <div style={{ color: "var(--text-secondary, #b1bac4)", lineHeight: 1.9 }}>
                <p>我們採取多項技術措施保護您的資料安全，包括：</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>所有 API 均要求登入驗證（Session-based JWT）。</li>
                  <li>資料庫查詢均限制於您個人帳號範圍，防止資料越權存取。</li>
                  <li>圖片上傳限制為常見圖片格式（JPEG、PNG、WebP、GIF）且最大 5MB。</li>
                  <li>外部 Webhook URL 僅允許合法的 HTTPS 公開網址。</li>
                </ul>
              </div>
            ),
          },
          {
            emoji: "📧",
            title: "7. 聯絡我們",
            content: (
              <div style={{ color: "var(--text-secondary, #b1bac4)", lineHeight: 1.9 }}>
                <p>若您對本隱私權政策有任何疑問，或希望行使您的資料權利（查閱、更正、刪除），請透過以下方式聯絡我們：</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>透過 Google Play 商店的開發者聯絡信箱</li>
                  <li>在 App 內的意見回饋功能</li>
                </ul>
                <p style={{ marginTop: 12 }}>本政策可能隨服務更新而修改，重大變更將於 App 內公告。</p>
              </div>
            ),
          },
        ].map(({ emoji, title, content }) => (
          <section
            key={title}
            style={{
              marginBottom: 36,
              padding: 28,
              borderRadius: 16,
              background: "var(--bg-card, rgba(255,255,255,0.03))",
              border: "1px solid var(--border, rgba(255,255,255,0.08))",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>{emoji}</span>
              <span>{title}</span>
            </h2>
            {content}
          </section>
        ))}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: 12,
              background: "var(--accent, #4a9eff)",
              color: "white",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            ← 返回阿嬤的冰箱
          </Link>
          <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted, #8b949e)" }}>
            © 2026 阿嬤的冰箱 Granny's Fridge. 保留一切權利。
          </p>
        </div>
      </div>
    </div>
  );
}
