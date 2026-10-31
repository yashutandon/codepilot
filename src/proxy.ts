import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Pass through request
  return NextResponse.next();
}

export { proxy };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
