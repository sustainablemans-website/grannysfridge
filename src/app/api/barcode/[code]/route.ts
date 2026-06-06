import { NextRequest, NextResponse } from "next/server";
import { fetchProductByBarcode } from "@/lib/openFoodFacts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;

  // Basic barcode sanity check (EAN-8, EAN-13, UPC-A, etc.)
  if (!/^\d{6,14}$/.test(code)) {
    return NextResponse.json({ error: "Invalid barcode format" }, { status: 400 });
  }

  const product = await fetchProductByBarcode(code);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}