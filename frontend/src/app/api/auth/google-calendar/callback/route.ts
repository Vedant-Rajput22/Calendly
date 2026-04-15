import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const userId = (session.user as any).id;

  // Verify state matches the user
  if (state !== userId) {
    return NextResponse.redirect(new URL("/settings?gcal=error&reason=invalid_state", req.nextUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/settings?gcal=error&reason=no_code", req.nextUrl.origin));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${req.nextUrl.origin}/api/auth/google-calendar/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings?gcal=error&reason=token_exchange", req.nextUrl.origin));
    }

    // Check if user already has a google account link
    const existingAccount = await (prisma as any).account.findFirst({
      where: { userId, provider: "google" },
    });

    if (existingAccount) {
      // Update the existing account with new tokens
      await (prisma as any).account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || existingAccount.refresh_token,
          expires_at: tokenData.expires_in
            ? Math.floor(Date.now() / 1000) + tokenData.expires_in
            : existingAccount.expires_at,
          scope: tokenData.scope || existingAccount.scope,
        },
      });
    } else {
      // Create a new account link for calendar
      await (prisma as any).account.create({
        data: {
          userId,
          type: "oauth",
          provider: "google",
          providerAccountId: `calendar_${userId}`,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in
            ? Math.floor(Date.now() / 1000) + tokenData.expires_in
            : null,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
        },
      });
    }

    return NextResponse.redirect(new URL("/settings?gcal=success", req.nextUrl.origin));
  } catch (error) {
    console.error("Google Calendar callback error:", error);
    return NextResponse.redirect(new URL("/settings?gcal=error&reason=server_error", req.nextUrl.origin));
  }
}
