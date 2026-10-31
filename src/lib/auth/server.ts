import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME, type AuthUser, type SessionPayload } from "./jwt";

export interface AuthContext {
  userId: string | null;
  user: AuthUser | null;
  token: string | null;
}

/**
 * Server-side helper to get authenticated user from incoming request or cookies.
 * Drop-in replacement for Clerk's `await auth()`.
 */
export async function getAuth(request?: Request): Promise<AuthContext> {
  let token: string | null = null;

  // 1. Check Authorization: Bearer <token>
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Check Cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value || null;
    } catch {
      // If called in an environment where cookies() throws
      if (request) {
        const cookieHeader = request.headers.get("cookie");
        if (cookieHeader) {
          const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
          if (match) {
            token = decodeURIComponent(match[1]);
          }
        }
      }
    }
  }

  if (!token) {
    return { userId: null, user: null, token: null };
  }

  const payload: SessionPayload | null = await verifyToken(token);

  if (!payload || !payload.sub) {
    return { userId: null, user: null, token: null };
  }

  const user: AuthUser = {
    id: payload.sub,
    email: payload.email as string,
    name: payload.name as string,
    picture: payload.picture as string | undefined,
    provider: payload.provider as "google" | "credentials" | undefined,
  };

  return {
    userId: payload.sub,
    user,
    token,
  };
}

/**
 * Attach the session JWT cookie to an outgoing NextResponse.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Remove the session JWT cookie from an outgoing NextResponse.
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

