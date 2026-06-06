import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate a random 6-character alphanumeric code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // exclude confusing chars
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  // Generate a unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.user.findUnique({ where: { lineConnectCode: code } });
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lineConnectCode: code },
  });

  return NextResponse.json({ code });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({
    lineUserId: user?.lineUserId || null,
    lineConnectCode: user?.lineConnectCode || null,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  await prisma.user.update({
    where: { id: userId },
    data: { lineUserId: null, lineConnectCode: null },
  });

  return NextResponse.json({ success: true });
}
