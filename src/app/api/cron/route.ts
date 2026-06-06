import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLineMessage, sendDiscordWebhook } from "@/lib/notifications";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all users with either LINE or Discord connected
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { lineUserId: { not: null } },
        { discordWebhookUrl: { not: null } },
      ],
    },
    include: {
      items: {
        where: { expiryDate: { not: null } },
        include: { location: true },
      },
    },
  });

  let notified = 0;
  const errors: string[] = [];

  for (const user of users) {
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
  }

  return NextResponse.json({ success: true, notified, errors });
}