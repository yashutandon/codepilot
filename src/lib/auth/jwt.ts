import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider?: "google" | "credentials";
}

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  provider?: "google" | "credentials";
}

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.CLERK_SECRET_KEY ||
  "codepilot-prod-jwt-secret-key-32-chars-minimum-token";

const secret = new TextEncoder().encode(JWT_SECRET);

export const JWT_ISSUER =
  process.env.NEXT_PUBLIC_APP_URL || "https://codepilot-ai.vercel.app";
export const JWT_AUDIENCE = "convex";
export const COOKIE_NAME = "codepilot_session";

/**
 * Sign a production-grade JWT session token.
 */
export async function signToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    email: user.email,
    name: user.name,
    picture: user.picture,
    provider: user.provider || "credentials",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

/**
 * Verify and decode a JWT session token.
 * Returns decoded payload or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      audience: JWT_AUDIENCE,
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

