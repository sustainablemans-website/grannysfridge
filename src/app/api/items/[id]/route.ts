import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { unlink } from "fs/promises";
import { join } from "path";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  imageUrl: z.string().url().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  reminderDays: z.number().int().min(0).max(365).optional(),
  quantity: z.number().int().min(1).max(9999).optional(),
  unit: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  tags: z.string().max(200).optional().nullable(),
  locationId: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
});

async function getItem(id: string, userId: string) {
  return prisma.item.findFirst({ where: { id, userId }, include: { location: true } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const item = await getItem(id, userId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const existing = await getItem(id, userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // IDOR guard: verify new locationId belongs to this user
  if (parsed.data.locationId) {
    const loc = await prisma.location.findFirst({
      where: { id: parsed.data.locationId, userId },
    });
    if (!loc) return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const data = parsed.data as any;
  if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);
  const updated = await prisma.item.update({ where: { id }, data, include: { location: true } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const existing = await getItem(id, userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Orphan image cleanup: delete local file if it's a /uploads/ path
  if (existing.imageUrl?.startsWith("/uploads/")) {
    const filePath = join(process.cwd(), "public", existing.imageUrl);
    try {
      await unlink(filePath);
    } catch {
      // File may already be gone — ignore error
    }
  }

  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ success: true });
}