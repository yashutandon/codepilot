import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";

export async function GET(request: Request) {
  try {
    const { userId, user, token } = await getAuth(request);

    if (!userId || !user) {
      return NextResponse.json(
        { authenticated: false, user: null, token: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json(
      { authenticated: false, user: null, token: null },
      { status: 200 }
    );
  }
}

