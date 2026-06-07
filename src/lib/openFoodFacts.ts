import { OpenFoodFactsProduct } from "@/types";

export async function fetchProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    return {
      product_name: p.product_name_zh || p.product_name_en || p.product_name || "",
      image_url: p.image_url || p.image_front_url || p.image_front_small_url || p.image_small_url || p.image_front_display_url || "",
      brands: p.brands || "",
      categories: p.categories || "",
      quantity: p.quantity || "",
    };
  } catch {
    return null;
  }
}
