import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// Simple string hash function to generate a unique numeric ID for Capacitor notifications (requires number IDs)
function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Schedule a local notification for an item
 */
export async function scheduleLocalNotification(item: {
  id: string;
  name: string;
  expiryDate: string | Date | null;
  reminderDays: number;
  locationName?: string;
}) {
  if (!Capacitor.isNativePlatform()) return;
  if (!item.expiryDate) return;

  try {
    const hasPermission = await LocalNotifications.checkPermissions();
    if (hasPermission.display !== "granted") {
      const request = await LocalNotifications.requestPermissions();
      if (request.display !== "granted") return;
    }

    // Cancel existing notification for this item if any
    const notificationId = getHashCode(item.id);
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });

    const expiry = new Date(item.expiryDate);
    
    // Get user-configured alert hour from localStorage, default to 9 AM
    const alertHourStr = localStorage.getItem("grannysfridge_alert_hour") || "9";
    const alertHour = parseInt(alertHourStr, 10);

    // Calculate notify date: (Expiry Date) - (Reminder Days)
    const notifyDate = new Date(expiry.getTime());
    notifyDate.setDate(notifyDate.getDate() - item.reminderDays);
    notifyDate.setHours(alertHour, 0, 0, 0);

    // If notify target date has already passed, schedule for immediate/near-future if item is still not expired
    const now = new Date();
    if (notifyDate.getTime() < now.getTime()) {
      // Don't notify if the item is already expired
      if (expiry.getTime() < now.getTime()) return;
      // Schedule 10 seconds from now
      notifyDate.setTime(now.getTime() + 10000);
    }

    const locationStr = item.locationName ?? "未指定";
    const daysLeft = item.reminderDays;
    const bodyText = daysLeft <= 0 
      ? `放在【${locationStr}】的「${item.name}」今天到期了，請儘速處理！`
      : `放在【${locationStr}】的「${item.name}」還有 ${daysLeft} 天到期，記得吃掉它！`;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "🍎 阿嬤的冰箱提醒",
          body: bodyText,
          id: notificationId,
          schedule: { at: notifyDate },
          sound: "default",
          extra: { itemId: item.id }
        }
      ]
    });
  } catch (err) {
    console.error("Local notification scheduling failed:", err);
  }
}

/**
 * Cancel a scheduled local notification for an item
 */
export async function cancelLocalNotification(itemId: string) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const notificationId = getHashCode(itemId);
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  } catch (err) {
    console.error("Local notification cancellation failed:", err);
  }
}

/**
 * Test notification: fires 5 seconds from now
 */
export async function triggerTestLocalNotification() {
  if (!Capacitor.isNativePlatform()) {
    alert("此為手機原生功能。請在 Android 實機/模擬器測試。");
    return;
  }
  try {
    const hasPermission = await LocalNotifications.checkPermissions();
    if (hasPermission.display !== "granted") {
      await LocalNotifications.requestPermissions();
    }
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "🧪 阿嬤的冰箱 - 本地測試通知",
          body: "恭喜！手機本地排程提醒連線測試成功！",
          id: 999999,
          schedule: { at: new Date(Date.now() + 5000) },
          sound: "default"
        }
      ]
    });
  } catch (err) {
    console.error("Test notification failed:", err);
  }
}
