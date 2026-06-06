import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendLineMessage, sendDiscordWebhook } from "@/lib/notifications";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

/**
 * POST /api/cron/trigger
 * Authenticated endpoint for users to manually test their own notifications.
 * Unlike /api/cron (requires CRON_SECRET), this is accessible to logged-in users
 * and only sends notifications for their own items.
 */
export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      items: {
        where: { expiryDate: { not: null } },
        include: { location: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!user.lineUserId && !user.discordWebhookUrl) {
    return NextResponse.json({ error: "No notification channel configured" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let notified = 0;
  const errors: string[] = [];

  for (const item of user.items) {
    if (!item.expiryDate) continue;
    const expiry = new Date(item.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft > item.reminderDays) continue;

    const payload = {
      itemName: item.name,
      expiryDate: format(expiry, "yyyy/MM/dd", { locale: zhTW }),
      locationName: item.location?.name ?? "未指定",
      daysLeft,
    };

    if (user.lineUserId) {
      try {
        const ok = await sendLineMessage(user.lineUserId, payload);
        if (ok) {
          await prisma.notificationLog.create({
            data: { itemId: item.id, channel: "LINE", message: `${item.name} 到期提醒`, success: true },
          });
          notified++;
        } else {
          errors.push(`LINE: ${item.name} 發送失敗`);
        }
      } catch (e: any) {
        errors.push(`LINE error: ${e.message}`);
      }
    }

    if (user.discordWebhookUrl) {
      try {
        const ok = await sendDiscordWebhook(user.discordWebhookUrl, payload);
        if (ok) {
          await prisma.notificationLog.create({
            data: { itemId: item.id, channel: "DISCORD", message: `${item.name} 到期提醒`, success: true },
          });
          notified++;
        } else {
          errors.push(`Discord: ${item.name} 發送失敗`);
        }
      } catch (e: any) {
        errors.push(`Discord error: ${e.message}`);
      }
    }
  }

  return NextResponse.json({ success: true, notified, errors });
}
