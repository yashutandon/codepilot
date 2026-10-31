import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/auth/google";
import { upsertGoogleUser } from "@/lib/auth/users";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/server";

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    console.warn("Google OAuth callback returned error:", error);
    if (error === "access_denied") {
      return NextResponse.redirect(`${baseUrl}/?auth_error=google_oauth_denied`);
    }
    return NextResponse.redirect(`${baseUrl}/?auth_error=google_oauth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=missing_code`);
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const profile = await exchangeGoogleCode(code, redirectUri);

    if (!profile) {
      console.error("Failed to retrieve Google profile from authorization code");
      return NextResponse.redirect(`${baseUrl}/?auth_error=verification_failed`);
    }

    const user = await upsertGoogleUser({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: "google",
    });

    const response = NextResponse.redirect(`${baseUrl}/?auth=success`);
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Error processing Google OAuth callback:", err);
    return NextResponse.redirect(`${baseUrl}/?auth_error=callback_exception`);
  }
}
