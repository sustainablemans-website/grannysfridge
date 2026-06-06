// LINE Messaging API Push Message Test
const TOKEN = "1KtlARt9fRY9rZozokIjtv4XyehYfMK9f14rOG0EC0vy7/2Tq/tq8e/awaAjOv7GPVScG9V5SUyuDdJYIYkTFLsHQaizfBkgAk7yTVnmg3nunT2LbrVdCn5rXNjK784HgJr8RHc1VFTWFl4hF4hMZwdB04t89/1O/w1cDnyilFU=";
const USER_ID = "U14ed1e536e5501d0a5cce2dab94151a9";

const body = {
  to: USER_ID,
  messages: [
    {
      type: "flex",
      altText: "🟡 阿嬤的冰箱 - 連線測試成功！",
      contents: {
        type: "bubble",
        hero: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "🍎 阿嬤的冰箱", size: "xl", weight: "bold", color: "#ffffff", align: "center" },
            { type: "text", text: "LINE 機器人連線測試", size: "sm", color: "#ffffffcc", align: "center" }
          ],
          backgroundColor: "#4A9EFF",
          paddingAll: "20px"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "✅ 成功！您的 LINE Bot 已設定完成", size: "md", weight: "bold", wrap: true },
            { type: "separator", margin: "md" },
            {
              type: "box", layout: "vertical", margin: "md", spacing: "sm",
              contents: [
                {
                  type: "box", layout: "horizontal",
                  contents: [
                    { type: "text", text: "📦 測試物品", color: "#888888", size: "sm", flex: 3 },
                    { type: "text", text: "鮮奶 (示範)", size: "sm", flex: 5 }
                  ]
                },
                {
                  type: "box", layout: "horizontal",
                  contents: [
                    { type: "text", text: "📅 到期日", color: "#888888", size: "sm", flex: 3 },
                    { type: "text", text: "2026/04/06", size: "sm", flex: 5 }
                  ]
                },
                {
                  type: "box", layout: "horizontal",
                  contents: [
                    { type: "text", text: "⚠️ 狀態", color: "#888888", size: "sm", flex: 3 },
                    { type: "text", text: "⏳ 還有 2 天到期", size: "sm", flex: 5, weight: "bold", color: "#e8590c" }
                  ]
                }
              ]
            },
            { type: "separator", margin: "md" },
            { type: "text", text: "未來當您的食材快過期時，機器人就會自動傳送這樣的提醒訊息給您！", size: "xs", color: "#888888", wrap: true, margin: "md" }
          ]
        }
      }
    }
  ]
};

fetch("https://api.line.me/v2/bot/message/push", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${TOKEN}`
  },
  body: JSON.stringify(body)
}).then(async (res) => {
  const text = await res.text();
  if (res.ok) {
    console.log("✅ SUCCESS! LINE 訊息發送成功，請查看您的 LINE！");
  } else {
    console.log(`❌ FAILED (Status: ${res.status}): ${text}`);
  }
}).catch(err => {
  console.error("❌ Error:", err.message);
});
