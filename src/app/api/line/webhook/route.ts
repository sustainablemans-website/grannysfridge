import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

function validateSignature(body: string, signature: string): boolean {
  if (!CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

async function replyToLine(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

  // Validate signature (skip in dev if secret not set)
  if (CHANNEL_SECRET && !validateSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const event of body.events || []) {
    const lineUserId = event.source?.userId;
    if (!lineUserId) continue;

    // Handle follow event - send welcome message
    if (event.type === "follow") {
      await replyToLine(event.replyToken, 
        "👋 嗨！我是阿嬤的冰箱管家！\n\n" +
        "請到 App 的「通知設定」頁面，點擊「產生連結碼」，然後把那組 6 位數的連結碼傳給我，" +
        "我就能幫您綁定帳號，以後自動提醒您的食材快過期囉！"
      );
      continue;
    }

    // Handle text message - check if it's a link code
    if (event.type === "message" && event.message?.type === "text") {
      const text = (event.message.text as string).trim().toUpperCase().replace(/\s/g, "");

      // Code pattern: 6 alphanumeric characters
      if (/^[A-Z0-9]{6}$/.test(text)) {
        const user = await prisma.user.findUnique({ where: { lineConnectCode: text } });

        if (!user) {
          await replyToLine(event.replyToken,
            "❌ 找不到此連結碼，請確認輸入的代碼是否正確，或是在 App 重新產生一組新的連結碼。"
          );
          continue;
        }

        // Check if this LINE account is already linked to another user
        const alreadyLinked = await prisma.user.findUnique({ where: { lineUserId } });
        if (alreadyLinked && alreadyLinked.id !== user.id) {
          await replyToLine(event.replyToken,
            "⚠️ 這個 LINE 帳號已經連結到另一個阿嬤的冰箱帳號了。"
          );
          continue;
        }

        // Link the LINE userId to the app user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lineUserId,
            lineConnectCode: null, // consume the code
          },
        });

        await replyToLine(event.replyToken,
          `✅ 帳號連結成功！\n\n您好，${user.name ?? ""}！\n` +
          "🍎 阿嬤的冰箱現在會在您的食材快過期時，" +
          "直接傳 LINE 訊息提醒您。\n\n" +
          "如需解除連結，請至 App「通知設定」頁面操作。"
        );
        continue;
      }

      // Non-code message
      await replyToLine(event.replyToken,
        "🤖 請到 App 的「通知設定」頁面，點擊「產生連結碼」，" +
        "然後把那組 6 位數的連結碼傳給我來綁定帳號！"
      );
    }
  }

  return NextResponse.json({ ok: true });
}
