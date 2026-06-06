export type Language = "zh-TW" | "en-US";

type TranslationKeys = string;

export const translations: Record<Language, Record<TranslationKeys, string>> = {
  "zh-TW": {
    "app.title": "阿嬤的冰箱",
    "nav.dashboard": "首頁",
    "nav.items": "食材清單",
    "nav.locations": "空間管理",
    "nav.settings": "設定",
    "nav.add": "新增",
    "nav.theme": "切換主題",
    "nav.language": "EN",
    
    "modal.addItem": "新增物品",
    "modal.barcode": "條碼",
    "modal.lookup": "查詢",
    "modal.itemName": "物品名稱 *",
    "modal.itemNamePlaceholder": "例如：牛奶、蘋果",
    "modal.quantity": "數量",
    "modal.unit": "單位",
    "modal.unitPlaceholder": "件/瓶",
    "modal.expiryDate": "有效期限",
    "modal.reminderDays": "提前提醒天數",
    "modal.location": "存放位置",
    "modal.locationNotSpecified": "未指定",
    "modal.notes": "備註",
    "modal.notesPlaceholder": "廠牌、購買地點...",
    "modal.cancel": "取消",
    "modal.saveItem": "儲存物品",
    "modal.saving": "儲存中...",
    "modal.errorFillName": "請填寫物品名稱",
    "modal.errorSave": "儲存失敗，請重試",

    "dashboard.totalItems": "總物品數",
    "dashboard.expiringSoon": "即將過期",
    "dashboard.expired": "已過期",
    "dashboard.locations": "存放空間",
    "dashboard.recentItems": "最近新增的物品",
    
    "common.days": "天",
    "common.loading": "載入中...",
    "common.none": "無",

    // Item Card
    "item.expiresIn": "剩餘 {days} 天",
    "item.expired": "已過期",

    // Login
    "login.nickname": "你的暱稱",
    "login.placeholder": "輸入暱稱開始使用...",
    "login.error": "請輸入你的暱稱",
    "login.failed": "登入失敗，請再試一次",
    "login.enter": "進入我的冰箱",
    "login.subtitle": "智慧食材管理，告別過期浪費",
    "login.tag1": "智慧管理",
    "login.tag2": "到期提醒",
    "login.tag3": "視覺化",
  },
  "en-US": {
    "app.title": "Granny's Fridge",
    "nav.dashboard": "Dashboard",
    "nav.items": "Items",
    "nav.locations": "Locations",
    "nav.settings": "Settings",
    "nav.add": "Add",
    "nav.theme": "Toggle Theme",
    "nav.language": "中",

    "modal.addItem": "Add Item",
    "modal.barcode": "Barcode",
    "modal.lookup": "Lookup",
    "modal.itemName": "Item Name *",
    "modal.itemNamePlaceholder": "e.g. Milk, Apple",
    "modal.quantity": "Quantity",
    "modal.unit": "Unit",
    "modal.unitPlaceholder": "pcs/bottle",
    "modal.expiryDate": "Expiry Date",
    "modal.reminderDays": "Reminder (days before)",
    "modal.location": "Location",
    "modal.locationNotSpecified": "Not specified",
    "modal.notes": "Notes",
    "modal.notesPlaceholder": "Brand, purchase location...",
    "modal.cancel": "Cancel",
    "modal.saveItem": "Save Item",
    "modal.saving": "Saving...",
    "modal.errorFillName": "Please fill in the item name",
    "modal.errorSave": "Save failed, please try again",

    "dashboard.totalItems": "Total Items",
    "dashboard.expiringSoon": "Expiring Soon",
    "dashboard.expired": "Expired",
    "dashboard.locations": "Locations",
    "dashboard.recentItems": "Recently Added Items",

    "common.days": "days",
    "common.loading": "Loading...",
    "common.none": "None",

    // Item Card
    "item.expiresIn": "{days} days left",
    "item.expired": "Expired",

    // Login
    "login.nickname": "Your Nickname",
    "login.placeholder": "Enter nickname to start...",
    "login.error": "Please enter your nickname",
    "login.failed": "Login failed, please try again",
    "login.enter": "Enter Fridge",
    "login.subtitle": "Smart Food Manager, Goodbye Expiry",
    "login.tag1": "Smart Mgmt",
    "login.tag2": "Expiry Alerts",
    "login.tag3": "Visualized",
  }
};
