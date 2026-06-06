import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const locationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["FRIDGE", "FREEZER", "CABINET", "OTHER"]).default("FRIDGE"),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  imageTemplate: z.string().max(100).optional().nullable(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const locations = await prisma.location.findMany({
    where: { userId },
    include: { items: { include: { location: true } }, children: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(locations);
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

  // Freemium limit: FREE users can add at most 3 locations
  if (user.plan === "FREE") {
    const locationCount = await prisma.location.count({ where: { userId } });
    if (locationCount >= 3) {
      return NextResponse.json(
        { error: "LimitReached", message: "免費版最多新增 3 個空間。請訂閱以解除限制！" },
        { status: 403 }
      );
    }
  }

  const body = await req.json();
  const parsed = locationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // IDOR guard: verify parentId belongs to this user
  if (parsed.data.parentId) {
    const parent = await prisma.location.findFirst({
      where: { id: parsed.data.parentId, userId },
    });
    if (!parent) return NextResponse.json({ error: "Parent location not found" }, { status: 404 });
  }

  const location = await prisma.location.create({ data: { ...parsed.data, userId } });
  return NextResponse.json(location, { status: 201 });
}