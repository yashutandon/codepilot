import { NextResponse } from "next/server";
import { getGoogleClientId, isGoogleAuthConfigured } from "@/lib/auth/google";

export async function GET() {
  const clientId = getGoogleClientId();
  const configured = isGoogleAuthConfigured();

  return NextResponse.json({
    configured,
    clientId: clientId || null,
  });
}

