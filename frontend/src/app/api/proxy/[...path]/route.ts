import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

const EXPRESS_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const ASSIGNMENT_DEFAULT_USER_ID =
  process.env.ASSIGNMENT_DEFAULT_USER_ID || "default-user-id";

export async function ANY(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  let sessionUserId: string | null = null;

  try {
    const session = await getServerSession(authOptions);
    sessionUserId = (session?.user as any)?.id || null;
  } catch (error) {
    // In assignment mode, auth/session issues should not break proxy requests.
    console.warn("Proxy session lookup failed, using assignment fallback user.");
  }
  
  // The path array will be ['auth', 'event-types'] -> join with '/'
  const targetPath = resolvedParams.path ? resolvedParams.path.join('/') : '';
  const searchParams = req.nextUrl.searchParams.toString();
  const query = searchParams ? `?${searchParams}` : '';
  
  const targetUrl = `${EXPRESS_API_URL}/${targetPath}${query}`;

  const headers = new Headers(req.headers);
  // Strip Next.js specific headers to prevent proxy contamination
  headers.delete("host");
  
  // Inject the validated User ID from NextAuth
  if (sessionUserId) {
    headers.set("x-user-id", sessionUserId);
  } else {
    // Assignment mode fallback: simulate default logged-in admin user
    headers.set("x-user-id", ASSIGNMENT_DEFAULT_USER_ID);
  }

  try {
    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual'
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) init.body = body;
    }

    const res = await fetch(targetUrl, init);

    // Stream the Express response back exactly as is
    const responseBody = await res.text();
    
    // Copy relevant headers over except ones that cause formatting conflicts
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(responseBody, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy connection to Backend failed." },
      { status: 502 }
    );
  }
}

export { ANY as DELETE, ANY as GET, ANY as PATCH, ANY as POST, ANY as PUT };

