const url = "https://discord.com/api/webhooks/1489676997348163715/HPvzd_xHvY-PxtI0kWuCOKV6G5WLPA1knUtgKww_Z0BR6i1uUNn1WhTGfS8AP2RvrM2B";

const payload = {
  embeds: [{
    title: "🍎 阿嬤的冰箱 - 食材到期警報測試",
    description: "這是一則測試通知，用以驗證您的 Discord 頻道是否能正確收到提醒！\n看來連線非常成功 🎉",
    color: 0xffaa00,
    fields: [
      { name: "📦 物品名稱", value: "鮮奶", inline: true },
      { name: "📍 存放位置", value: "冰箱冷藏 / 右側門", inline: true },
      { name: "⏳ 到期日", value: "2026/04/06", inline: true },
      { name: "⚠️ 狀態", value: "剩餘 2 天", inline: true }
    ],
    footer: { text: "阿嬤的冰箱 智能管家" },
    timestamp: new Date().toISOString()
  }]
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
}).then(res => {
  if(res.ok) console.log("SUCCESS");
  else console.log("FAILED", res.status);
}).catch(console.error);
