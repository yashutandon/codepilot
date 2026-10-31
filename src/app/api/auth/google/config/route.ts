import { NextResponse } from "next/server";
import {
  getGoogleClientId,
  getGoogleClientSecret,
  isGoogleAuthConfigured,
} from "@/lib/auth/google";

export async function GET() {
  const clientId = getGoogleClientId();
  const hasSecret = Boolean(getGoogleClientSecret());
  const configured = isGoogleAuthConfigured();

  return NextResponse.json({
    configured,
    clientId: clientId || null,
    hasClientId: Boolean(clientId),
    hasSecret,
  });
}

