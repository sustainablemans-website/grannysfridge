# 阿嬤的冰箱 (Granny's Fridge) 商業化上架與正式部署指南

這份文件旨在說明將目前的開發版本轉化為正式商業產品並上架至 Google Play 商店（及正式伺服器）所需的資源、設定與策略。

---

## 1. 基礎建設與雲端環境 (Infrastructure & Zero-Cost Strategy)

為了達到初期 **$0 部署成本** 並確保系統具備擴充性，建議採用以下組合：

### A. 網頁前端與託管 (Frontend Hosting)
*   **建議平台**：Vercel
    *   *Free Tier (Hobby)*：提供免費的 Next.js 無伺服器託管，含自動 SSL 憑證，不超過流量限制皆免費。
    *   **需要資訊**：自訂網域名稱 (例: `grannysfridge.com`)。

### B. 資料庫與儲存方案 (Database & Storage)
*   **首選建議**：**Supabase**
    *   **理由**：除了強大的 PostgreSQL，它內建的 Storage 功能非常適合儲存使用者上傳的「冰箱內容物照片」。且內建的 Edge Functions 方便未來擴充。
    *   *Free Tier*：提供 500MB 資料庫與 2GB 檔案儲存空間，對小型初期專案綽綽有餘。
    *   **遷移注意**：從 SQLite 遷移至 Supabase PostgreSQL 時，需檢查 Prisma 的 Schema 相容性（如 `@default(now())` 寫法與 DateTime 格式）。

---

## 2. 行動端打包與原生優化 (Capacitor & App Store)

若要上架 Google Play，單純的 Web 環境需強化為原生體驗：

### A. 核心功能強化
*   **相機與條碼掃描**：在 Capacitor 中強烈建議使用 `@capacitor-mlkit/barcode-scanning` 插件，其效能與讀取成功率遠高於單純的 Web 端相機 API。
*   **離線與同步機制 (重要)**：考慮到廚房或某些角落訊號不佳，建議在 App 內導入 PWA 特性或 `TanStack Query` 的快取機制，確保斷網時仍能讀取冰箱清單，連線後再同步。

### B. 深度連結 (Deep Links)
*   為確保使用者點擊 LINE 到期通知時能直接喚醒 App（而非打開瀏覽器），需在伺服器端網域的 `.well-known` 資料夾下部署 `assetlinks.json`。

### C. 商店與隱私權準備
*   **固定成本**：Google Play 開發者帳號 (一次性 $25 USD)。
*   **隱私權政策 (Privacy Policy)**：Google 極為看重個資與權限宣告。
    *   必須明確告知將收集：Email、相機權限（條碼用）、冰箱存儲數據。
    *   建議使用 Privacy Policy Generator 生成，並託管在專案路由 `/privacy` 中提供審核。

---

## 3. 第三方整合與環境變數清單 (Config & Keys)

以下為正式部署所需的環境變數總表。其中已收集到的金鑰已填寫於清單內：

```env
# ---------------------------------------------------------
# [ 已收集 / 本地開發使用中 ]
# ---------------------------------------------------------
# Google OAuth 登入
GOOGLE_CLIENT_ID="[YOUR_GOOGLE_CLIENT_ID]"
GOOGLE_CLIENT_SECRET="[YOUR_GOOGLE_CLIENT_SECRET]"

# LINE Messaging API (每月 200 則免費通知)
LINE_CHANNEL_ACCESS_TOKEN="[YOUR_LINE_CHANNEL_ACCESS_TOKEN]"
LINE_CHANNEL_SECRET="[YOUR_LINE_CHANNEL_SECRET]"
LINE_USER_ID="[YOUR_LINE_USER_ID]"


# ---------------------------------------------------------
# [ 待準備 / 正式上架時需填寫 ]
# ---------------------------------------------------------
# 資料庫與檔案儲存 (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" // 待申請
SUPABASE_URL="https://[PROJECT_ID].supabase.co"      // 待申請
SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"                  // 待申請

# 安全與授權 (NextAuth / Operations)
NEXTAUTH_SECRET="" // 產線環境加密必備，請用 `openssl rand -base64 32` 生成
NEXTAUTH_URL="https://your-domain.com"
CRON_SECRET=""     // 排程 API 觸發密碼，請重新輸入更強的一組亂碼

# 速率限制 (防護 API 被惡意刷流量)
RATE_LIMIT_MAX="100"
```

---

## 4. 正式上架流程下一步驟

1.  **申請 Supabase 帳號**：建立專案，並將取得的 `DATABASE_URL` 與 `SUPABASE_URL` 提供給我，我將為您進行資料庫遷移測試。
2.  **生成 Privacy Policy**：建立 `/privacy` 頁面。
3.  **Vercel 部署**：將這包程式碼上傳綁定至 Vercel 取得線上網址。
4.  **Capacitor 打包與外掛安裝**：整合 ML Kit Scanner 與設定 Deep Link。
5.  **Google Play 審核發佈**：完成問卷並上傳 AAB 檔。
