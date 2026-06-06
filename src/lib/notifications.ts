interface NotifyPayload {
  itemName: string;
  expiryDate: string;
  locationName: string;
  daysLeft: number;
}

export async function sendLineMessage(
  userId: string,
  payload: NotifyPayload
): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  const emoji = payload.daysLeft <= 0 ? "🔴" : payload.daysLeft <= 2 ? "🟠" : "🟡";
  const status = payload.daysLeft <= 0 ? "⚠️ 已過期！請盡快處理！" : `⏳ 還有 ${payload.daysLeft} 天到期`;

  const body = {
    to: userId,
    messages: [
      {
        type: "flex",
        altText: `${emoji} 阿嬤的冰箱 - ${payload.itemName} 快到期了！`,
        contents: {
          type: "bubble",
          hero: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🍎 阿嬤的冰箱",
                size: "xl",
                weight: "bold",
                color: "#ffffff",
                align: "center",
              },
              {
                type: "text",
                text: "食材到期警報",
                size: "sm",
                color: "#ffffffcc",
                align: "center",
              }
            ],
            backgroundColor: payload.daysLeft <= 0 ? "#e03131" : payload.daysLeft <= 2 ? "#e8590c" : "#f59f00",
            paddingAll: "20px",
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: payload.itemName,
                size: "xl",
                weight: "bold",
                wrap: true,
              },
              {
                type: "separator",
                margin: "md",
              },
              {
                type: "box",
                layout: "vertical",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      { type: "text", text: "📍 存放位置", color: "#888888", size: "sm", flex: 3 },
                      { type: "text", text: payload.locationName, size: "sm", flex: 5, wrap: true },
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      { type: "text", text: "📅 到期日", color: "#888888", size: "sm", flex: 3 },
                      { type: "text", text: payload.expiryDate, size: "sm", flex: 5 },
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      { type: "text", text: "⚠️ 狀態", color: "#888888", size: "sm", flex: 3 },
                      { type: "text", text: status, size: "sm", flex: 5, weight: "bold", color: payload.daysLeft <= 0 ? "#e03131" : payload.daysLeft <= 2 ? "#e8590c" : "#f59f00" },
                    ]
                  },
                ]
              }
            ]
          }
        }
      }
    ]
  };

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Legacy shim - kept for backwards compatibility in cron
export async function sendLineNotify(
  token: string,
  payload: NotifyPayload
): Promise<boolean> {
  // token here is actually the userId stored in lineWebhookUrl field
  return sendLineMessage(token, payload);
}

/**
 * SSRF Guard: reject URLs that resolve to private/internal network ranges.
 * Allows only HTTPS to public hosts — blocks localhost, 127.x, 10.x, 172.16-31.x, 192.168.x
 */
function isSafeWebhookUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  // Must be HTTPS
  if (parsed.protocol !== "https:") return false;

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost variations
  if (hostname === "localhost" || hostname === "::1") return false;

  // Block private IPv4 ranges via regex
  const privateIpPatterns = [
    /^127\./,                       // loopback
    /^10\./,                        // class A private
    /^172\.(1[6-9]|2\d|3[0-1])\./,  // class B private
    /^192\.168\./,                  // class C private
    /^169\.254\./,                  // link-local
    /^0\./,                         // invalid
  ];
  for (const pattern of privateIpPatterns) {
    if (pattern.test(hostname)) return false;
  }

  return true;
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: NotifyPayload
): Promise<boolean> {
  // SSRF guard: only allow safe public HTTPS URLs
  if (!isSafeWebhookUrl(webhookUrl)) {
    console.warn("Blocked unsafe Discord webhook URL:", webhookUrl);
    return false;
  }

  const color = payload.daysLeft <= 0 ? 0xff0000 : payload.daysLeft <= 2 ? 0xff6600 : 0xffaa00;
  const status = payload.daysLeft <= 0 ? "⚠️ 已過期！" : `剩餘 ${payload.daysLeft} 天`;
  const body = {
    embeds: [{
      title: "🍎 阿嬤的冰箱 - 食材到期警報",
      description: `您的冰箱裡有物品快要過期了，請盡快處理喔！`,
      color,
      fields: [
        { name: "📦 物品名稱", value: payload.itemName, inline: true },
        { name: "📍 存放位置", value: payload.locationName, inline: true },
        { name: "⏳ 到期日", value: payload.expiryDate, inline: true },
        { name: "⚠️ 狀態", value: status, inline: true }
      ],
      footer: { text: "阿嬤的冰箱 智能管家" },
      timestamp: new Date().toISOString(),
    }],
  };
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}