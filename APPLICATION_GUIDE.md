# 申請流程與操作指南 (Application Guide)

為了將《阿嬤的冰箱》推向正式的商業營運，我們需要使用幾個雲端服務的正式版環境。本文件提供了圖文並茂的申請步驟，幫助您快速取得所有必要的「金鑰」與「帳號」。

---

## 1. Supabase (資料庫與儲存空間)

Supabase 提供了我們即將替換掉本地 SQLite 所需的高效能 PostgreSQL 雲端資料庫，並且提供圖片無伺服器儲存方案。

**申請步驟：**
1. 進入 [Supabase 官網](https://supabase.com/) 並點擊 **Start your project**，建議直接使用您的 GitHub 或 Google 帳號授權登入。
2. 進入 Dashboard 後，點選 **New Project**。
3. **填寫專案細節：**
   - **Name**: `GrannysFridge` (或任何您喜歡的好記名稱)
   - **Database Password**: 請設定一組高強度密碼，並**強烈建議您馬上把它複製並記錄下來**（未來連線需要使用）。
   - **Region**: 請選擇靠近目標客群的地區，例如 `Tokyo` (東京) 或 `Singapore` (新加坡)。
4. 點擊彈出的 **Create new project** 等待約 2-5 分鐘讓資料庫建立。
5. **取得金鑰 (交給我處理的部分)：**
   - 建立完畢後，在左側選單進入 **Project Settings (齒輪圖案)** -> **Database**。
   - 往下拉找到 **Connection string** (選擇 URI 格式)，這串 URL 將是您的 `DATABASE_URL`。 (請記得把 URL 內的中括號 `[YOUR-PASSWORD]` 換成您剛剛設定的密碼)。
   - 再從左側進入 **API** 標籤頁。
   - 複製 `Project URL` (這就是您的 `SUPABASE_URL`)。
   - 複製 `Project API keys` 區塊裡的 `anon` / `public` 金鑰 (這就是您的 `SUPABASE_ANON_KEY`)。

---

## 2. Vercel (網站發佈環境與 SSL)

因為我們採用了業界主流的 Next.js 框架，部署到其開發母公司 (Vercel) 會擁有最完美、不需配置即可享有全球 CDN 加速的體驗。

**申請步驟：**
1. 進入 [Vercel 官網](https://vercel.com/)，點選 **Sign Up**。建議使用 GitHub 帳號註冊以便將來自動化佈署。
2. 填寫簡單的基本資訊直到進入 Vercel Dashboard。
3. （可選）如果您希望由我在終端機 (CLI) 幫您自動推送到 Vercel，我們需要一個 **Token**：
   - 滑鼠移至右上角您的頭像，點擊 **Settings**。
   - 點擊左側選單的 **Tokens**。
   - 點選 **Create**，名稱填寫 `GrannysFridge Deploy`，權限設定為 `Full Account`，並設定期限為 `No Expiration` (不過期，或 30天)。
   - 生成後會有一串 `Token` 字串，這非常機密，請將它提供給我。

---

## 3. Google Play Console (Android 上架帳號)

若您要將我們後續打包好的 Capacitor Android AAB 檔案放上 Google 商店供一般民眾下載，這是一定要經過的步驟。

**申請步驟：**
1. 進入 [Google Play Console](https://play.google.com/console/about/) 官網。
2. 登入您打算作為「開發者」的 Google 帳號。
3. 系統會詢問這是個人體驗還是機構，選擇**個人 (Personal)** 帳號。
4. 填寫您的開發者名稱 (這會顯示在商店 App 名稱的下方)、聯絡信箱以及電話。
5. **支付費用**：Google 會收取**一次性 $25 美元** 的註冊費用（這與 Apple 每年收 99 美金不同，終生只需繳一次）。使用信用卡進行解鎖。
6. 完成身份與證件驗證後，您的帳號即可開始上架 App。

> **備註：** 這個步驟您可以在 App 完全打包完畢後再來執行，目前不急於一時！

---

## 總結：您需要回傳給我的資訊

當您看完本指南，您只需要花個 5 分鐘去註冊，最後提供以下內容給我：

```text
DATABASE_URL: (Supabase 的 Connection 字串，含密碼)
SUPABASE_URL: (Supabase 的 Project URL)
SUPABASE_ANON_KEY: (Supabase 的 Anon Key)
VERCEL_TOKEN: (若您希望我透過 CLI 幫您發佈專案)
```
