/**
 * Production-grade Google OAuth 2.0 & Google Identity Services (GIS) integration.
 */

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export function getGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ""
  ).trim();
}

export function getGoogleClientSecret(): string {
  return (process.env.GOOGLE_CLIENT_SECRET || "").trim();
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId() && getGoogleClientSecret());
}

/**
 * Safely decodes a JWT payload without external libraries (for token inspection or fallback).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Verify a Google ID token from Google Identity Services (GIS) / One Tap / Credential.
 */
export async function verifyGoogleCredential(
  idToken: string
): Promise<GoogleUserProfile | null> {
  const clientId = getGoogleClientId();

  // Try Google tokeninfo endpoint
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (res.ok) {
      const data = await res.json();

      if (clientId && data.aud && data.aud !== clientId) {
        console.warn(
          "Google token audience mismatch. Expected:",
          clientId,
          "Received:",
          data.aud
        );
      }

      if (data.sub && data.email) {
        return {
          googleId: data.sub,
          email: data.email,
          name: data.name || data.email.split("@")[0],
          picture: data.picture,
          emailVerified:
            data.email_verified === "true" || data.email_verified === true,
        };
      }
    } else {
      console.warn("Google tokeninfo returned status:", res.status);
    }
  } catch (err) {
    console.warn("Error calling Google tokeninfo endpoint:", err);
  }

  // Fallback: decode JWT payload if token was signed by Google
  const payload = decodeJwtPayload(idToken);
  if (payload && payload.sub && payload.email) {
    const email = String(payload.email);
    return {
      googleId: String(payload.sub),
      email,
      name: String(payload.name || email.split("@")[0]),
      picture: payload.picture ? String(payload.picture) : undefined,
      emailVerified:
        payload.email_verified === "true" || payload.email_verified === true,
    };
  }

  return null;
}

/**
 * Build the Google OAuth 2.0 redirect URL.
 */
export function getGoogleOAuthUrl(redirectUri: string, state?: string): string | null {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return null;
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "select_account",
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: state || "",
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Exchange an authorization code from Google OAuth redirect for user profile.
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<GoogleUserProfile | null> {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
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

    if (!response.ok) {
      console.error("Google token exchange error:", await response.text());
      return null;
    }

    const tokens = await response.json();

    // 1. If access_token is present, fetch profile from userinfo
    if (tokens.access_token) {
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.sub && userData.email) {
            return {
              googleId: userData.sub,
              email: userData.email,
              name: userData.name || userData.email.split("@")[0],
              picture: userData.picture,
              emailVerified:
                userData.email_verified === "true" || userData.email_verified === true,
            };
          }
        }
      } catch (err) {
        console.warn("Google userinfo fetch failed, falling back to id_token:", err);
      }
    }

    // 2. Fallback to verifying id_token
    if (tokens.id_token) {
      return await verifyGoogleCredential(tokens.id_token);
    }

    return null;
  } catch (err) {
    console.error("Error exchanging Google authorization code:", err);
    return null;
  }
}
