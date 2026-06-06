import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1).max(200),
  barcode: z.string().max(100).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  reminderDays: z.number().int().min(0).max(365).default(3),
  quantity: z.number().int().min(1).max(9999).default(1),
  unit: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  tags: z.string().max(200).optional().nullable(),
  locationId: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const search = searchParams.get("search");
  const items = await prisma.item.findMany({
    where: {
      userId,
      ...(locationId ? { locationId } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    include: { location: true },
    orderBy: [{ expiryDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  // Retrieve user plan to check limits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Freemium limit: FREE users can add at most 30 items
  if (user.plan === "FREE") {
    const itemCount = await prisma.item.count({ where: { userId } });
    if (itemCount >= 30) {
      return NextResponse.json(
        { error: "LimitReached", message: "免費版最多新增 30 個食材。請訂閱以解除限制！" },
        { status: 403 }
      );
    }
  }

  const body = await req.json();
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // IDOR guard: verify locationId belongs to this user
  if (parsed.data.locationId) {
    const loc = await prisma.location.findFirst({
      where: { id: parsed.data.locationId, userId },
    });
    if (!loc) return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const item = await prisma.item.create({
    data: { ...parsed.data, userId, expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null },
    include: { location: true },
  });
  return NextResponse.json(item, { status: 201 });
}