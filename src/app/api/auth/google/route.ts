import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyGoogleCredential,
  exchangeGoogleCode,
  getGoogleOAuthUrl,
  isGoogleAuthConfigured,
  getGoogleClientId,
} from "@/lib/auth/google";
import { upsertGoogleUser } from "@/lib/auth/users";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/server";

function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const googlePostSchema = z.object({
  credential: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
});

/**
 * GET /api/auth/google
 * Initiates the Google OAuth 2.0 redirect flow.
 */
export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=google_not_configured`);
  }

  const oauthUrl = getGoogleOAuthUrl(redirectUri);
  if (!oauthUrl) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=google_not_configured`);
  }

  return NextResponse.redirect(oauthUrl);
}

/**
 * POST /api/auth/google
 * Handles Google Identity Services (GIS) token verification or authorization code exchange.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = googlePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid Google authentication request payload" },
        { status: 400 }
      );
    }

    const { credential, code, redirectUri } = parsed.data;

    let profile = null;

    if (credential) {
      profile = await verifyGoogleCredential(credential);
    } else if (code) {
      const baseUrl = getBaseUrl(request);
      const targetRedirectUri = redirectUri || `${baseUrl}/api/auth/google/callback`;
      profile = await exchangeGoogleCode(code, targetRedirectUri);
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Unable to verify Google credentials. Please make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in .env.local",
        },
        { status: 401 }
      );
    }

    const user = await upsertGoogleUser({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: "google" as const,
    };

    const token = await signToken(authUser);
    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Google auth route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during Google sign-in." },
      { status: 500 }
    );
  }
}
