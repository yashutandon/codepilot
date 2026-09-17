import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-models";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

import { DEFAULT_CONVERSATION_TITLE } from "../../../../../convex/constants";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Please sign in to create a project" }, { status: 401 });
  }

  const internalKey = process.env.CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Internal server key not configured" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Please provide a project description" },
      { status: 400 }
    );
  }

  const { prompt } = parseResult.data;

  // Let AI decide the project name based on the user prompt (with 3s timeout to never delay project creation)
  let projectName = "";
  try {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 3000)
    );

    const namePromise = (async () => {
      const { text } = await generateTextWithFallback({
        system:
          "You are an AI assistant. Output ONLY a 2-3 word kebab-case project name (e.g. 'todo-app', 'crypto-tracker', 'weather-hub'). No quotes, no markdown, no explanation.",
        prompt: `Name this project: "${prompt}"`,
      });
      return text;
    })();

    const text = await Promise.race([namePromise, timeoutPromise]);
    if (text) {
      const cleaned = text
        .trim()
        .toLowerCase()
        .replace(/["'`]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (cleaned && cleaned.length >= 2) {
        projectName = cleaned.slice(0, 30);
      }
    }
  } catch (err) {
    console.warn("AI project name generation failed, falling back:", err);
  }

  // Fallback: build a clean name from the prompt or random adjectives
  if (!projectName) {
    const words = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => !["build", "create", "a", "an", "the", "make", "app", "website", "project", "in", "with"].includes(w))
      .slice(0, 3);

    if (words.length > 0) {
      projectName = words.join("-") + "-app";
    } else {
      projectName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals, colors],
        separator: "-",
        length: 3,
      });
    }
  }

  try {
    // Create project and conversation together
    const { projectId, conversationId } = await convex.mutation(
      api.system.createProjectWithConversation,
      {
        internalKey,
        projectName,
        conversationTitle: DEFAULT_CONVERSATION_TITLE,
        ownerId: userId,
      },
    );

    // Create user message
    await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId,
      projectId,
      role: "user",
      content: prompt,
    });

    // Create assistant message placeholder with processing status
    const assistantMessageId = await convex.mutation(
      api.system.createMessage,
      {
        internalKey,
        conversationId,
        projectId,
        role: "assistant",
        content: "",
        status: "processing",
      },
    );

    // Trigger Inngest to process the message in the background
    try {
      await inngest.send({
        name: "message/sent",
        data: {
          messageId: assistantMessageId,
          conversationId,
          projectId,
          message: prompt,
        },
      });
    } catch (err) {
      console.error("Failed to send Inngest event:", err);
      await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId: assistantMessageId,
        content:
          "⚠️ **Inngest Dev Server is not running.**\n\nBackground AI execution requires the Inngest local runner in development.\nPlease start it in your terminal by running:\n```bash\nnpm run inngest:dev\n```\n(Or configure `INNGEST_EVENT_KEY` in `.env.local` if using Inngest Cloud).",
      });
    }

    return NextResponse.json({ projectId });
  } catch (err: any) {
    console.error("Failed to create project in Convex:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to initialize project in database" },
      { status: 500 }
    );
  }
}