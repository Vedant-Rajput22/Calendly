import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// GET: Check if current user has Google Calendar connected
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const account = await (prisma as any).account.findFirst({
      where: { userId, provider: "google" },
      select: { id: true, refresh_token: true, scope: true },
    });

    const hasCalendarScope =
      account?.scope?.includes("https://www.googleapis.com/auth/calendar") ||
      account?.scope?.includes("https://www.googleapis.com/auth/calendar.events");
    const isConnected = !!(account?.refresh_token && hasCalendarScope);

    return NextResponse.json({ connected: isConnected });
  } catch (error) {
    console.error("Error checking Google Calendar status:", error);
    return NextResponse.json({ connected: false });
  }
}
