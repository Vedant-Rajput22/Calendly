import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // Delete the Google OAuth account record for the user
    await (prisma as any).account.deleteMany({
      where: { 
        userId: userId,
        provider: "google"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disconnect Google Calendar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
