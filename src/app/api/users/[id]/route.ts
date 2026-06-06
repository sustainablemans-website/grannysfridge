import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      discordWebhookUrl: true,
      lineWebhookUrl: true,
      lineUserId: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  // Allow updating webhook URLs
  const updateData: any = {};
  if (data.discordWebhookUrl !== undefined) {
    // Validate Discord webhook URL format (must be official Discord URL)
    if (data.discordWebhookUrl !== null) {
      const isDiscordUrl =
        typeof data.discordWebhookUrl === "string" &&
        /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(data.discordWebhookUrl);
      if (!isDiscordUrl) {
        return NextResponse.json({ error: "Invalid Discord webhook URL format." }, { status: 400 });
      }
    }
    updateData.discordWebhookUrl = data.discordWebhookUrl;
  }
  if (data.lineWebhookUrl !== undefined) {
    updateData.lineWebhookUrl = data.lineWebhookUrl;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No data to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, user });
}

