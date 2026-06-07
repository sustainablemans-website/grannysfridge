import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { webhookUrl } = await req.json();

  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
  }

  // Basic validation of Discord webhook URL format
  const isDiscordUrl =
    typeof webhookUrl === "string" &&
    /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(webhookUrl);

  if (!isDiscordUrl) {
    return NextResponse.json({ error: "Invalid Discord webhook URL format." }, { status: 400 });
  }

  const payload = {
    itemName: "🍎 測試食材 (蘋果)",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("zh-TW"),
    locationName: "冷藏室",
    daysLeft: 3,
  };

  const success = await sendDiscordWebhook(webhookUrl, payload);

  if (success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Failed to send notification via Discord" }, { status: 500 });
  }
}
