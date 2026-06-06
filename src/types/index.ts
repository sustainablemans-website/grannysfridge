export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  lineWebhookUrl?: string | null;
  discordWebhookUrl?: string | null;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  icon?: string | null;
  color?: string | null;
  parentId?: string | null;
  sortOrder: number;
  posX?: number | null;
  posY?: number | null;
  userId: string;
  imageTemplate?: string | null;
  children?: Location[];
  items?: Item[];
}

export type LocationType = "FRIDGE" | "FREEZER" | "CABINET" | "OTHER";

export interface Item {
  id: string;
  barcode?: string | null;
  name: string;
  imageUrl?: string | null;
  expiryDate?: Date | string | null;
  reminderDays: number;
  quantity: number;
  unit?: string | null;
  notes?: string | null;
  tags?: string | null;
  locationId?: string | null;
  regionId?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  location?: Location | null;
}

export interface OpenFoodFactsProduct {
  product_name?: string;
  image_url?: string;
  brands?: string;
  categories?: string;
  quantity?: string;
}

export type DaysStatus = "expired" | "critical" | "warning" | "ok";

export function getDaysUntilExpiry(expiryDate: Date | string | null | undefined): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(days: number | null): DaysStatus {
  if (days === null) return "ok";
  if (days < 0) return "expired";
  if (days <= 2) return "critical";
  if (days <= 7) return "warning";
  return "ok";
}
