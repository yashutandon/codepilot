import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { findUserById } from "@/lib/auth/users";
import { inngest } from "@/inngest/client";

const requestSchema = z.object({
  projectId: z.string(),
  repoName: z.string().min(1).max(100),
  visibility: z.enum(["public", "private"]).default("private"),
  description: z.string().max(350).optional(),
});

export async function POST(request: Request) {
  const { userId } = await getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, repoName, visibility, description } = requestSchema.parse(body);

  const user = await findUserById(userId);
  const githubToken = user?.githubToken || process.env.GITHUB_TOKEN;

  if (!githubToken) {
    return NextResponse.json(
      { error: "GitHub not connected. Please provide a GITHUB_TOKEN environment variable." },
      { status: 400 }
    );
  }

  const internalKey = process.env.CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const event = await inngest.send({
    name: "github/export.repo",
    data: {
      projectId,
      repoName,
      visibility,
      description,
      githubToken,
      internalKey,
    },
  });

  return NextResponse.json({ 
    success: true, 
    projectId, 
    eventId: event.ids[0]
  });
}
